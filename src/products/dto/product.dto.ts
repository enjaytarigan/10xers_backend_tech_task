import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  isURL,
  Length,
  Matches,
} from 'class-validator';
import { ProductEntity } from '../entity/product.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 255, {
    message: 'title must be at least between 5 and 255 characters',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255, { message: 'slug must be between 3 and 255 characters' })
  @Matches(/^[a-z0-9\-_]+$/, {
    message:
      'slug can only contain lowercase letters, numbers, hyphens, and underscores',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive({ message: 'price must be a positive number' })
  price: number;
}

export class CreateProductResponse {
  productId: number;

  constructor(product: ProductEntity) {
    this.productId = product.id;
  }
}

export class EditProductDto extends PartialType(CreateProductDto) {}

export class ProductResponse {
  title: string;

  slug: string;

  description: string;

  price: number;

  createdAt: Date;

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
