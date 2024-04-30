import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ProductEntity } from '../entity/product.entity';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(5, 255, {
    message: 'title must be at least between 5 and 255 characters',
  })
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(3, 255, { message: 'slug must be between 3 and 255 characters' })
  @Matches(/^[a-z0-9\-_]+$/, {
    message:
      'slug can only contain lowercase letters, numbers, hyphens, and underscores',
  })
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive({ message: 'price must be a positive number' })
  price: number;
}

export class CreateProductResponse {
  @ApiProperty()
  productId: number;

  constructor(product: ProductEntity) {
    this.productId = product.id;
  }
}

export class EditProductDto extends PartialType(CreateProductDto) {}

export class ProductResponse {
  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;

  constructor(product: ProductEntity) {
    this.title = product.title;
    this.slug = product.slug;
    this.description = product.description;
    this.price = product.price;
    this.createdAt = product.createdAt;
    this.createdBy = product.createdBy;
  }
}

export class GetProductDtoRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  page: number;
}
