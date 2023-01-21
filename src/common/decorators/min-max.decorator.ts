import { applyDecorators } from "@nestjs/common";
import { MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

/**
 * It's a decorator that takes a min and max value and returns a decorator that applies the MinLength
 * and MaxLength decorators to the property
 * @param {number} min - The minimum length of the string
 * @param {number} max - number - The maximum length of the string
 * @param [each=false] - If true, the validation will be applied to each element of the array.
 * @returns A function that takes a class and returns a class.
 */
export const MinMaxLength = (min: number, max: number, each = false) => {
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
};
