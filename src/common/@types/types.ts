import { AnySchema } from "joi";

import { IFile } from "./interfaces";

// This function is used to convert a joi schema to typescript interface.
export type JoiTypeToInterFace<T> = {
	[K in keyof T]: T[K] extends AnySchema<infer R> ? R : never;
};

// This type represents a dto that contains a file or files
export type DtoWithFile<T, K = IFile> = T & {
	files: K;
};

export const isArray = <T>(value: unknown): value is T[] => {
	return Array.isArray(value);
};
