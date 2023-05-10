import { Dictionary } from "@mikro-orm/core";
import { QueryBuilder } from "@mikro-orm/postgresql";

import { CursorTypeEnum, QueryOrderEnum } from "../enums";

export interface IQueryBuilderPaginationOptions<T extends Dictionary> {
	alias: string;
	cursor: keyof T;
	cursorType: CursorTypeEnum;
	first: number;
	order: QueryOrderEnum;
	qb: QueryBuilder<T>;
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
