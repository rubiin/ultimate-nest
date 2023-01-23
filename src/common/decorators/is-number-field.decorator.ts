import { IsNumberFieldOptions } from "@common/types";
import { applyDecorators } from "@nestjs/common";
import { Type } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	Max,
	Min,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

/**
 * It's a decorator that validates a number field
 * @param {IsNumberFieldOptions} [ops] - IsNumberFieldOptions
 * @returns A function that returns a decorator.
 */

export const IsNumberField = (ops?: IsNumberFieldOptions) => {
	const options = {
		min: 1,
		max: Number.POSITIVE_INFINITY,
		int: true,
		positive: true,
		required: true,
		each: false,
		...ops,
	};
	const decoratorsToApply = [
		Type(() => Number),
		Min(options.min, { message: i18nValidationMessage("validation.min") }),
		Max(options.max, { message: i18nValidationMessage("validation.max") }),
	];

	if (options.int) {
		decoratorsToApply.push(
			IsInt({
				message: i18nValidationMessage("validation.isDataType", {
					type: "integer number",
				}),
				each: options.each,
			}),
		);
	} else {
		decoratorsToApply.push(
			IsNumber(
				{},
				{
					message: i18nValidationMessage("validation.isDataType", {
						type: "number",
					}),
					each: options.each,
				},
			),
		);
	}

	if (options.positive) {
		decoratorsToApply.push(
			IsPositive({
				message: i18nValidationMessage("validation.isDataType", {
					type: "positive number",
				}),
				each: options.each,
			}),
		);
	}

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
