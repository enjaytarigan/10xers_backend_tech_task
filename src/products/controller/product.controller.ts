import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
  EditProductDto,
  ProductResponse,
} from '../dto/product.dto';
import { ProductService } from '../product.service';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Manage Products')
@Controller('/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @ApiCreatedResponse({
    type: CreateProductResponse,
  })
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
  @ApiOkResponse({
    type: ProductResponse,
  })
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

  @Put('/:productId')
  @ApiOkResponse({
    type: ProductResponse,
  })
  async editById(
    @Param(
      'productId',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_FOUND,
      }),
    )
    productId: number,
    @Body() dto: EditProductDto,
    @Res() res: Response,
  ) {
    const product = await this.productService.editById(productId, dto);

    const resBody = new BaseDto(
      'product updated successfully',
      new ProductResponse(product),
    );

    res.status(HttpStatus.OK).json(resBody);
  }

  @Delete('/:productId')
  @ApiOkResponse({})
  async deleteById(
    @Param(
      'productId',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_FOUND,
      }),
    )
    productId: number,
    @Res() res: Response,
  ) {
    await this.productService.deleteById(productId);

    const resBody = new BaseDto('product deleted successfully', null);

    res.status(HttpStatus.OK).json(resBody);
  }
}
