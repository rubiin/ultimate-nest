import { CursorPaginationDto, OffsetPaginationDto } from "@common/dtos";
import { Dictionary } from "@mikro-orm/core";
import { QueryBuilder } from "@mikro-orm/postgresql";

import { CursorPaginationResponse } from "../classes/cursor.response";
import { OffsetPaginationResponse } from "../classes/offset.response";
import { CursorType, QueryCursor, QueryOrder } from "../enums";

export interface QBCursorPaginationOptions<T extends Dictionary> {
	alias: string;
	cursor: keyof T;
	cursorType: CursorType;
	first: number;
	order: QueryOrder;
	qb: QueryBuilder<T>;
	fields: string[];
	after?: string;
	search?: string;
}

export interface PaginateOptions<T> {
	instances: T[];
	currentCount: number;
	previousCount: number;
	cursor: keyof T;
	first: number;
	search?: string;
}

export interface QBOffsetPaginationOptions<T extends Dictionary> {
	pageOptionsDto: OffsetPaginationDto;
	qb: QueryBuilder<T>;
}

export interface PaginationRequestAbstract {
	search: string;
	fields: string[];
}

export interface PaginationAbstractResponse<T, Y> {
	data: T[];
	meta: Y;
}

export type Order = "$gt" | "$lt";
export type OppositeOrder = "$gte" | "$lte";

export const getCursorType = (cursor: QueryCursor): CursorType =>
	cursor === QueryCursor.DATE ? CursorType.NUMBER : CursorType.STRING;

export const getQueryOrder = (order: QueryOrder): Order =>
	order === QueryOrder.ASC ? "$gt" : "$lt";

export const getOppositeOrder = (order: QueryOrder): OppositeOrder =>
	order === QueryOrder.ASC ? "$lte" : "$gte";

export type PaginationRequest = CursorPaginationDto | OffsetPaginationDto;
export type PaginationResponse<T> = CursorPaginationResponse<T> | OffsetPaginationResponse<T>;
