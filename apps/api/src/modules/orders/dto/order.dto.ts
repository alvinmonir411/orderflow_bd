import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatusEnum {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  DISPATCHED_TO_COURIER = 'DISPATCHED_TO_COURIER',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum ChannelTypeEnum {
  FACEBOOK_MESSENGER = 'FACEBOOK_MESSENGER',
  WHATSAPP = 'WHATSAPP',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
}

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerName!: string;

  @IsNotEmpty()
  @IsString()
  customerPhone!: string;

  @IsNotEmpty()
  @IsString()
  deliveryAddress!: string;

  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @IsOptional()
  @IsEnum(ChannelTypeEnum)
  channel?: ChannelTypeEnum;

  @IsOptional()
  @IsNumber()
  deliveryCharge?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  status!: OrderStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
