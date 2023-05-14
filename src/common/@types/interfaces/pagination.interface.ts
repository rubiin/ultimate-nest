import { OffsetPaginationDto } from "@common/dtos/offset-pagination.dto";
import { Dictionary } from "@mikro-orm/core";
import { QueryBuilder } from "@mikro-orm/postgresql";

import { CursorType, QueryOrder } from "../enums";

export interface IQBCursorPaginationOptions<T extends Dictionary> {
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

export interface IPaginateOptions<T> {
	instances: T[];
	currentCount: number;
	previousCount: number;
	cursor: keyof T;
	first: number;
	search?: string;
}

export interface IQBOffsetPaginationOptions<T extends Dictionary> {
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
