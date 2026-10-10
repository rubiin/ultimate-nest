import { CursorPaginationDto, OffsetPaginationDto } from "@common/dtos";
import { Dictionary, QueryBuilder } from "@mikro-orm/postgresql";

import { CursorPaginationResponse, OffsetPaginationResponse } from "../classes";
import { QueryOrder } from "../enums";

export interface CursorPaginationOptions<T extends Dictionary> extends Omit<
  CursorPaginationDto,
  "type"
> {
  cursor: keyof T;
  order: QueryOrder;
  searchField: keyof T;
}

export interface QBOffsetPaginationOptions<T extends Dictionary> {
  pageOptionsDto: Omit<OffsetPaginationDto, "type"> & { searchField: keyof T; alias: string };
  qb: QueryBuilder<T, string>;
}

export interface PaginationAbstractResponse<T, Y> {
  data: T[];
  meta: Y;
}

export type PaginationRequest = CursorPaginationDto | OffsetPaginationDto;
export type PaginationResponse<T> = CursorPaginationResponse<T> | OffsetPaginationResponse<T>;
