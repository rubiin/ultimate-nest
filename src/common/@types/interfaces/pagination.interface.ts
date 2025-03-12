import  { CursorPaginationDto, OffsetPaginationDto } from "@common/dtos"
import  { Dictionary, QueryBuilder } from "@mikro-orm/postgresql"
import { CursorType, QueryCursor, QueryOrder } from "../enums"
import  { CursorPaginationResponse, OffsetPaginationResponse } from "../classes"

export interface QBCursorPaginationOptions<T extends Dictionary> {
  qb: QueryBuilder<T>
  pageOptionsDto: Omit<CursorPaginationDto, "type"> & {
    alias: string
    cursor: keyof T
    cursorType: CursorType
    order: QueryOrder
    searchField: keyof T
  }
}

export interface QBOffsetPaginationOptions<T extends Dictionary> {
  pageOptionsDto: Omit<OffsetPaginationDto, "type"> & { searchField: keyof T, alias: string }
  qb: QueryBuilder<T>
}

export interface PaginateOptions<T> {
  instances: T[]
  currentCount: number
  previousCount: number
  cursor: keyof T
  first: number
  search?: string
}

export interface PaginationAbstractResponse<T, Y> {
  data: T[]
  meta: Y
}

export type Order = "$gt" | "$lt"
export type OppositeOrder = `${Order}e`

export function getCursorType(cursor: QueryCursor): CursorType {
  return cursor === QueryCursor.DATE ? CursorType.NUMBER : CursorType.STRING
}

export function getQueryOrder(order: QueryOrder): Order {
  return order === QueryOrder.ASC ? "$gt" : "$lt"
}

export function getOppositeOrder(order: QueryOrder): OppositeOrder {
  return order === QueryOrder.ASC ? "$lte" : "$gte"
}

export type PaginationRequest = CursorPaginationDto | OffsetPaginationDto
export type PaginationResponse<T> = CursorPaginationResponse<T> | OffsetPaginationResponse<T>
