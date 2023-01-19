import { IsNumberFieldOptions } from "@common/types";
import { applyDecorators } from "@nestjs/common";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

/**
 * It's a decorator that validates a number field
 * @param {IsNumberFieldOptions} [ops] - IsNumberFieldOptions
 * @returns A function that returns a decorator.
 */

export const IsNumberField = (ops?: IsNumberFieldOptions) => {
	const options = { min: 1, max: Number.POSITIVE_INFINITY, required: true, each: false, ...ops };
	const decoratorsToApply = [
		Type(() => Number),
		IsInt({
			message: i18nValidationMessage("validation.isDataType", {
				type: "number",
			}),
			each: options.each,
		}),
		Min(options.min, { message: i18nValidationMessage("validation.min") }),
		Max(options.max, { message: i18nValidationMessage("validation.max") }),
	];

	options.required
		? decoratorsToApply.push(
				IsNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
				}),
				ArrayNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") }),
		  )
		: decoratorsToApply.push(IsOptional());

	if (options.each) {
		decoratorsToApply.push(
			IsArray({
				message: i18nValidationMessage("validation.isDataType", {
					type: "array",
				}),
			}),
		);
	}

	return applyDecorators(...decoratorsToApply);
};
