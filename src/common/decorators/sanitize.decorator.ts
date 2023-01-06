import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import DOMPurify from "isomorphic-dompurify";

export function Sanitize() {
	return applyDecorators(
		Transform(({ value }) => DOMPurify.sanitize(value.trim()), { toClassOnly: true }),
	);
}
