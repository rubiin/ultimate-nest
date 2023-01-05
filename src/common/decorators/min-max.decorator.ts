import { applyDecorators } from "@nestjs/common";
import { MinLength, MaxLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export function MinMax(min: number, max: number, each = false) {
	return applyDecorators(
		MinLength(min, {
			message: i18nValidationMessage("validation.minLength"),
			each,
		}),
		MaxLength(max, {
			message: i18nValidationMessage("validation.maxLength"),
			each,
		}),
	);
}
