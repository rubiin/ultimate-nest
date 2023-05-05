import { AnySchema } from "joi";

import { CursorTypeEnum, EmailTemplateEnum, QueryCursorEnum, QueryOrderEnum } from "./enums";
import { IFile } from "./interfaces";

// This function is used to convert a joi schema to typescript interface.
export type JoiTypeToInterFace<T> = {
	[K in keyof T]: T[K] extends AnySchema<infer R> ? R : never;
};

// This type represents a dto that contains a file or files
export type DtoWithFile<T, K = IFile> = T & {
	files: K;
};

export type tOrderEnum = "$gt" | "$lt";
export type tOppositeOrder = "$gte" | "$lte";

export const isArray = <T>(value: unknown): value is T[] => {
	return Array.isArray(value);
};

export const isUndefined = (value: unknown): value is undefined => {
	return value === undefined;
};

export const isNull = (value: unknown): value is null => value === null;

export const getCursorType = (cursor: QueryCursorEnum): CursorTypeEnum =>
	cursor === QueryCursorEnum.DATE ? CursorTypeEnum.NUMBER : CursorTypeEnum.STRING;

export const getQueryOrder = (order: QueryOrderEnum): tOrderEnum =>
	order === QueryOrderEnum.ASC ? "$gt" : "$lt";

export const getOppositeOrder = (order: QueryOrderEnum): tOppositeOrder =>
	order === QueryOrderEnum.ASC ? "$lte" : "$gte";

export type EmailSubject = keyof typeof EmailTemplateEnum extends `${infer T}_TEMPLATE` ? T : never;
