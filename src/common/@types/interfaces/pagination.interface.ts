import { Dictionary } from "@mikro-orm/core";
import { QueryBuilder } from "@mikro-orm/postgresql";

import { CursorTypeEnum, QueryOrderEnum } from "../enums";

export interface QueryBuilderPaginationOptions<T extends Dictionary> {
	alias: string;
	cursor: keyof T;
	cursorType: CursorTypeEnum;
	first: number;
	order: QueryOrderEnum;
	qb: QueryBuilder<T>;
	after?: string;
}

export interface PaginateOptions<T> {
	instances: T[];
	currentCount: number;
	previousCount: number;
	cursor: keyof T;
	first: number;
}
