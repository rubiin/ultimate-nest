import { AnySchema } from "joi";

// This function is used to extract the type of a joi schema.

export type JoiInfer<T> = T extends AnySchema<infer K> ? K : never;

// This function is used to convert a joi schema to an interface.
export type JoiTypeToInterFace<T> = {
	[K in keyof T]: JoiInfer<T[K]>;
};
