import { CursorPaginationDto, OffsetPaginationDto } from "@common/dtos";
import { Dictionary } from "@mikro-orm/core";
import { QueryBuilder } from "@mikro-orm/postgresql";

import { CursorPaginationResponse, OffsetPaginationResponse } from "../classes";
import { CursorType, QueryCursor, QueryOrder } from "../enums";

export interface QBCursorPaginationOptions<T extends Dictionary> {
	qb: QueryBuilder<T>;
	pageOptionsDto: Omit<CursorPaginationDto, "type"> & {
		alias: string;
		cursor: keyof T;
		cursorType: CursorType;
		order: QueryOrder;
		searchField: keyof T;
	};
}

export interface QBOffsetPaginationOptions<T extends Dictionary> {
	pageOptionsDto: OffsetPaginationDto & { searchField: keyof T; alias: string };
	qb: QueryBuilder<T>;
}

export interface PaginateOptions<T> {
	instances: T[];
	currentCount: number;
	previousCount: number;
	cursor: keyof T;
	first: number;
	search?: string;
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
