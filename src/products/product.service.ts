import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '../../src/common/pagination.service';
import { DataSource, Repository } from 'typeorm';
import {
  CreateProductDto,
  EditProductDto,
  GetProductDtoRequest,
} from './dto/product.dto';
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

    await this.validateSlug(dto.slug);

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

  async editById(productId: number, dto: EditProductDto) {
    const product = await this.getById(productId);

    if (product.slug !== dto.slug) {
      await this.validateSlug(dto.slug);
    }

    product.update(dto);

    await this.productRepository.update(
      { id: productId },
      {
        title: product.title,
        description: product.description,
        slug: product.slug,
        price: product.price,
      },
    );

    return product;
  }

  async deleteById(productId: number) {
    await this.getById(productId);

    await this.productRepository.delete({ id: productId });
  }

  async getProducts(query: GetProductDtoRequest) {
    const { limit, offset } = PaginationService.getPagination(
      query.page,
      query.size,
    );
    const qb = this.productRepository.createQueryBuilder('product');

    if (query.search != null && query.search.length > 0) {
      qb.where('product.title ILIKE :search', { search: `%${query.search}%` });
    }

    const [products, count] = await qb
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return {
      products,
      ...PaginationService.getPaginationMetadata({
        totalData: count,
        page: query.size,
        limit,
      }),
    };
  }

  // Slug is valid when it isn't used yet.
  private async validateSlug(slug: string) {
    const productBySlug = await this.productRepository.findOneBy({
      slug: slug,
    });

    if (productBySlug != null) {
      throw new BadRequestException('slug already used');
    }
  }
}
