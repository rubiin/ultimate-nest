import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function Sanitize() {
	return applyDecorators(
		Transform(({ value }) => purify.sanitize(value.trim()), { toClassOnly: true }),
	);
}
