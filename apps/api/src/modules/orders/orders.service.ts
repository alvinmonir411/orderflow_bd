import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto, OrderStatusEnum, UpdateOrderStatusDto } from './dto/order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    storeId: string,
    filters?: {
      status?: OrderStatusEnum;
      channel?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { storeId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.channel) {
      where.channel = filters.channel;
    }

    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerPhone: { contains: filters.search } },
        { deliveryAddress: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(storeId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('অর্ডারটি পাওয়া যায়নি');
    }

    return order;
  }

  async create(storeId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('অন্তত একটি প্রোডাক্ট নির্বাচন করতে হবে');
    }

    // 1. Calculate Items Total
    let itemsPrice = 0;
    for (const item of dto.items) {
      itemsPrice += Number(item.unitPrice) * item.quantity;
    }

    const deliveryCharge = dto.deliveryCharge ?? 70;
    const discount = dto.discount ?? 0;
    const totalPrice = itemsPrice + deliveryCharge - discount;

    // 2. Find or Create Customer
    let customer = await this.prisma.customer.findFirst({
      where: {
        storeId,
        phone: dto.customerPhone,
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          storeId,
          name: dto.customerName,
          phone: dto.customerPhone,
          address: dto.deliveryAddress,
          district: dto.deliveryCity,
          totalOrders: 1,
        },
      });
    } else {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          address: dto.deliveryAddress || customer.address,
        },
      });
    }

    // 3. Create Order with Items
    const order = await this.prisma.order.create({
      data: {
        storeId,
        customerId: customer.id,
        channel: (dto.channel as any) || 'MANUAL_ENTRY',
        status: OrderStatusEnum.CONFIRMED,
        itemsPrice,
        deliveryCharge,
        discount,
        totalPrice,
        deliveryAddress: dto.deliveryAddress,
        deliveryCity: dto.deliveryCity,
        customerPhone: dto.customerPhone,
        customerName: dto.customerName,
        notes: dto.notes,
        items: {
          create: dto.items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // 4. Deduct Inventory Stock
    for (const item of dto.items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  }

  async updateStatus(storeId: string, id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.findOne(storeId, id);

    const updated = await this.prisma.order.update({
      where: { id: existing.id },
      data: {
        status: dto.status as any,
        notes: dto.notes ? `${existing.notes || ''}\n${dto.notes}`.trim() : existing.notes,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return updated;
  }

  async getMetrics(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      pendingCount,
      confirmedCount,
      dispatchedCount,
      deliveredCount,
      allOrders,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          storeId,
          createdAt: { gte: today },
        },
      }),
      this.prisma.order.count({
        where: { storeId, status: OrderStatusEnum.PENDING_CONFIRMATION },
      }),
      this.prisma.order.count({
        where: { storeId, status: OrderStatusEnum.CONFIRMED },
      }),
      this.prisma.order.count({
        where: { storeId, status: OrderStatusEnum.DISPATCHED_TO_COURIER },
      }),
      this.prisma.order.count({
        where: { storeId, status: OrderStatusEnum.DELIVERED },
      }),
      this.prisma.order.findMany({
        where: { storeId, status: { notIn: [OrderStatusEnum.CANCELLED, OrderStatusEnum.RETURNED] } },
        select: { totalPrice: true },
      }),
      this.prisma.product.count({
        where: { storeId, stock: { lte: 5 } },
      }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    return {
      todayOrders,
      pendingCount,
      confirmedCount,
      dispatchedCount,
      deliveredCount,
      totalRevenue,
      lowStockAlerts: lowStockProducts,
    };
  }

  async checkCustomerRisk(phone: string) {
    // BD Courier Fraud / Return rate calculation
    const customerOrders = await this.prisma.order.findMany({
      where: { customerPhone: phone },
      select: { status: true },
    });

    const total = customerOrders.length;
    if (total === 0) {
      return {
        phone,
        totalOrders: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        successRate: 100,
        riskLevel: 'NEW_CUSTOMER', // LOW / MEDIUM / HIGH / NEW_CUSTOMER
        statusLabel: 'নতুন কাস্টমার (নিরাপদ)',
      };
    }

    const delivered = customerOrders.filter((o) => o.status === OrderStatusEnum.DELIVERED).length;
    const returned = customerOrders.filter((o) => o.status === OrderStatusEnum.RETURNED).length;
    const cancelled = customerOrders.filter((o) => o.status === OrderStatusEnum.CANCELLED).length;

    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    let riskLevel = 'LOW';
    let statusLabel = 'অর্ডার কনফার্ম করা নিরাপদ (সাকসেস রেট ভালো)';

    if (successRate < 50 && total >= 2) {
      riskLevel = 'HIGH';
      statusLabel = 'সতর্কতা: রিটার্ন রেট বেশি (অর্ডারের আগে অ্যাডভান্স নিন)';
    } else if (successRate < 75 && total >= 2) {
      riskLevel = 'MEDIUM';
      statusLabel = 'মধ্যম ঝুঁকি (ডেলিভারি চার্জ অ্যাডভান্স নেওয়া ভালো)';
    }

    return {
      phone,
      totalOrders: total,
      delivered,
      returned,
      cancelled,
      successRate,
      riskLevel,
      statusLabel,
    };
  }
}
