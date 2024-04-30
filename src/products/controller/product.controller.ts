import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseDto } from '../../common/base.dto';
import { AuthGuard, IAuthRequest } from '../../users/auth.guard';
import {
  CreateProductDto,
  CreateProductResponse,
  ProductResponse,
} from '../dto/product.dto';
import { ProductService } from '../product.service';

@UseGuards(AuthGuard)
@Controller('/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: IAuthRequest,
    @Res() res: Response,
  ) {
    const product = await this.productService.create(dto, req.user.userId);
    const resBody = new BaseDto(
      'product created successfully',
      new CreateProductResponse(product),
    );

    res.status(HttpStatus.CREATED).json(resBody);
  }

  @Get('/:productId')
  async getById(
    @Param(
      'productId',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_FOUND,
        exceptionFactory(error) {
          return 'product not found';
        },
      }),
    )
    productId: number,
    @Res() res: Response,
  ) {
    const product = await this.productService.getById(productId);

    const resBody = new BaseDto(
      'success get product',
      new ProductResponse(product),
    );

    res.status(HttpStatus.OK).json(resBody);
  }
}
