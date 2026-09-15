import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto, UpdateStockDto } from './dto/product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(storeId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, storeId },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException('প্রোডাক্ট পাওয়া যায়নি');
    }

    return product;
  }

  async create(storeId: string, dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        storeId,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            stock: v.stock,
            priceDiff: v.priceDiff || 0,
          })),
        } : undefined,
      },
      include: { variants: true },
    });
  }

  async update(storeId: string, id: string, dto: Partial<CreateProductDto>) {
    await this.findOne(storeId, id);
    const { variants, ...productData } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
      },
      include: { variants: true },
    });
  }

  async updateStock(storeId: string, id: string, dto: UpdateStockDto) {
    await this.findOne(storeId, id);

    if (dto.variantId) {
      const variant = await this.prisma.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: dto.stock },
      });
      return variant;
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: dto.stock },
    });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getLowStockAlerts(storeId: string, threshold = 5) {
    return this.prisma.product.findMany({
      where: {
        storeId,
        stock: { lte: threshold },
      },
      include: {
        variants: {
          where: { stock: { lte: threshold } },
        },
      },
    });
  }
}
