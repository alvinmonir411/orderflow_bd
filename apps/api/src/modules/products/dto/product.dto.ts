import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsNotEmpty()
  @IsString()
  name!: string; // e.g., "Size: M", "Color: Red"

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  stock!: number;

  @IsOptional()
  @IsNumber()
  priceDiff?: number;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  basePrice!: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  stock!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}

export class UpdateStockDto {
  @IsNotEmpty()
  @IsNumber()
  stock!: number;

  @IsOptional()
  @IsString()
  variantId?: string;
}
