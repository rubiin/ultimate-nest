import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function Sanitize() {
	return applyDecorators(
		Transform(({ value }) => purify.sanitize(value.trim()), { toClassOnly: true }),
	);
}
