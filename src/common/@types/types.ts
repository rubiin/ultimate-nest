import { CursorPaginationDto, OffsetPaginationDto } from "@common/dtos";
import { AnySchema } from "joi";

import { CursorPaginationResponse } from "./cursor.pagination";
import { CursorType, EmailTemplate, QueryCursor, QueryOrder } from "./enums";
import { File } from "./interfaces";
import { OffsetPaginationResponse } from "./offset.pagination";

// This function is used to convert a joi schema to typescript interface.
export type JoiTypeToInterFace<T> = {
	[K in keyof T]: T[K] extends AnySchema<infer R> ? R : never;
};

// This type represents a dto that contains a file or files
export type DtoWithFile<T, K = File> = T & {
	files: K;
};

export type Order = "$gt" | "$lt";
export type OppositeOrder = "$gte" | "$lte";

export const isArray = <T>(value: unknown): value is T[] => {
	return Array.isArray(value);
};

export const isUndefined = (value: unknown): value is undefined => {
	return value === undefined;
};

export const isNull = (value: unknown): value is null => value === null;

export const getCursorType = (cursor: QueryCursor): CursorType =>
	cursor === QueryCursor.DATE ? CursorType.NUMBER : CursorType.STRING;

export const getQueryOrder = (order: QueryOrder): Order =>
	order === QueryOrder.ASC ? "$gt" : "$lt";

export const getOppositeOrder = (order: QueryOrder): OppositeOrder =>
	order === QueryOrder.ASC ? "$lte" : "$gte";

export type TEmailSubject = keyof typeof EmailTemplate extends `${infer T}_TEMPLATE` ? T : never;

export type PaginationRequest = CursorPaginationDto | OffsetPaginationDto;
export type PaginationResponse<T> = CursorPaginationResponse<T> | OffsetPaginationResponse<T>;
