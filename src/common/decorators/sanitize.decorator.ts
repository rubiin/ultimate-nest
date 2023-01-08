import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import DOMPurify from "isomorphic-dompurify";

/**
 * It takes a string, sanitizes it, and returns the sanitized string
 * @returns A decorator function that will be applied to the class.
 */
export const Sanitize = () => {
	return applyDecorators(
		Transform(({ value }) => DOMPurify.sanitize(value.trim()), { toClassOnly: true }),
	);
};
