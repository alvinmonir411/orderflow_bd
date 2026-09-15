import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, OrderStatusEnum, UpdateOrderStatusDto } from './dto/order.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import type { CurrentUserPayload } from '../auth/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @GetUser() user: CurrentUserPayload,
    @Query('status') status?: OrderStatusEnum,
    @Query('channel') channel?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll(user.storeId, {
      status,
      channel,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('metrics')
  getMetrics(@GetUser() user: CurrentUserPayload) {
    return this.ordersService.getMetrics(user.storeId);
  }

  @Get('check-risk/:phone')
  checkRisk(@Param('phone') phone: string) {
    return this.ordersService.checkCustomerRisk(phone);
  }

  @Get(':id')
  findOne(@GetUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.ordersService.findOne(user.storeId, id);
  }

  @Post()
  create(@GetUser() user: CurrentUserPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.storeId, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @GetUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(user.storeId, id, dto);
  }
}
