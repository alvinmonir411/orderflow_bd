import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateStockDto } from './dto/product.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import type { CurrentUserPayload } from '../auth/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@GetUser() user: CurrentUserPayload) {
    return this.productsService.findAll(user.storeId);
  }

  @Get('low-stock')
  getLowStock(
    @GetUser() user: CurrentUserPayload,
    @Query('threshold') threshold?: string,
  ) {
    return this.productsService.getLowStockAlerts(
      user.storeId,
      threshold ? parseInt(threshold, 10) : 5,
    );
  }

  @Get(':id')
  findOne(@GetUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.productsService.findOne(user.storeId, id);
  }

  @Post()
  create(@GetUser() user: CurrentUserPayload, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.storeId, dto);
  }

  @Patch(':id')
  update(
    @GetUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(user.storeId, id, dto);
  }

  @Patch(':id/stock')
  updateStock(
    @GetUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.productsService.updateStock(user.storeId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.productsService.remove(user.storeId, id);
  }
}
