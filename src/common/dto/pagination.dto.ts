import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from './base.dto';

export class PaginationDtoIn {
  @ApiPropertyOptional()
  keyword: string;

  @ApiProperty({ default: 1 })
  page: number;

  @ApiProperty({
    default: 10,
  })
  size: number;
}

export class BasePaginationDto<T> extends BaseDto<T> {
  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  constructor(
    message: string,
    data: T,
    paginationMetaData: {
      currentPage: number;
      totalPages: number;
    },
  ) {
    super(message, data);
    this.currentPage = paginationMetaData.currentPage;
    this.totalPages = paginationMetaData.totalPages;
  }
}
