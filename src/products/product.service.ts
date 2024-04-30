import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/product.dto';
import { ProductEntity } from './entity/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    private dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    const newProduct = this.productRepository.create({
      title: dto.title,
      description: dto.description,
      slug: dto.slug,
      price: dto.price,
      createdBy: userId,
    });

    const productBySlug = await this.productRepository.findOneBy({
      slug: dto.slug,
    });

    if (productBySlug != null) {
      throw new BadRequestException('slug already used');
    }

    const { identifiers } = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(ProductEntity)
      .values(newProduct)
      .returning(['id'])
      .execute();

    newProduct.id = identifiers[0].id;

    return newProduct;
  }

  async getById(productId: number) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
      select: {
        id: true,
        price: true,
        title: true,
        description: true,
        slug: true,
        createdAt: true,
        createdBy: true,
      },
    });

    if (product == null) {
      throw new NotFoundException('product not found');
    }

    return product;
  }
}
