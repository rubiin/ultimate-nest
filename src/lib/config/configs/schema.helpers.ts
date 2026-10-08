import { z } from "zod";

// Env vars always reach the schema as strings. `.min(1)` rejects empty values
// up front, otherwise `Number("")` would coerce them to a valid `0`.
const nonEmptyString = z.string().min(1);

/**
 * Coerces an env var to a number, optionally narrowed by `schema`.
 */
export const envNumber = (schema: z.ZodType<number, number> = z.number()) =>
  nonEmptyString.pipe(z.coerce.number()).pipe(schema);

export const envPort = () => envNumber(z.number().int().min(0).max(65535));

/** Treats an empty var as missing, so a required field cannot be blank. */
export const envString = () => nonEmptyString;

/**
 * `z.enum` wants a non-empty tuple while the shared constants are plain `string[]`.
 */
export const oneOf = (values: string[]) => z.enum(values as [string, ...string[]]);
