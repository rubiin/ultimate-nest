import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import type { OffsetPaginationDto } from "@common/dtos/offset-pagination.dto";
import type { PaginationAbstractResponse } from "../interfaces";

export class OffsetMeta {
  /**
   * @example 10
   */
  @ApiProperty()
  readonly page: number;

  /**
   * @example 50
   */
  @ApiProperty()
  readonly limit: number;

  /**
   * @example 20
   */
  @ApiProperty()
  readonly itemCount: number;

  /**
   * @example 100
   */
  @ApiProperty()
  readonly pageCount: number;

  /**
   * @example true
   */
  @ApiProperty()
  readonly hasPreviousPage: boolean;

  /**
   * @example true
   */
  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({
    pageOptionsDto,
    itemCount,
  }: {
    pageOptionsDto: Omit<OffsetPaginationDto, "type">
    itemCount: number
  }) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class OffsetPaginationResponse<T> implements PaginationAbstractResponse<T, OffsetMeta> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => OffsetMeta })
  readonly meta: OffsetMeta;

  constructor(data: T[], meta: OffsetMeta) {
    this.data = data;
    this.meta = meta;
  }
}
