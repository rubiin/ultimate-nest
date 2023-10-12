import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import type { PaginationAbstractResponse } from "../interfaces";

export class CursorMeta {
  /**
   * @example AdVxY2F0ZWdvcnlfaWQ9MjMx
   */
  @ApiProperty()
    nextCursor!: string;

  /**
   * @example false
   */
  @ApiProperty()
    hasNextPage!: boolean;

  /**
   * @example true
   */
  @ApiProperty()
    hasPreviousPage!: boolean;

  /**
   * @example "lorem ipsum"
   */
  @ApiProperty()
    search?: string;
}

export class CursorPaginationResponse<T> implements PaginationAbstractResponse<T, CursorMeta> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data!: T[];

  @ApiProperty({ type: () => CursorMeta })
  readonly meta!: CursorMeta;
}
