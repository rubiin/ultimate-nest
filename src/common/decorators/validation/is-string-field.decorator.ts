import { StringFieldOptions } from "@common/@types";
import { applyDecorators } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { MinMaxLength } from "./min-max-length.decorator";
import { Sanitize, Trim } from "./transform.decorator";

/**
 * It's a decorator that validates a string field
 * @param {StringFieldOptions} [options_] - IsStringFieldOptions
 * @returns A function that returns a decorator.
 */

export const IsStringField = (options_?: StringFieldOptions) => {
	const options: StringFieldOptions = {
		minLength: 2,
		maxLength: 1000,
		required: true,
		each: false,
		sanitize: true,
		trim: true,
		...options_,
	};
	const decoratorsToApply = [
		IsString({
			message: i18nValidationMessage("validation.isDataType", {
				type: "string",
			}),
			each: options.each,
		}),
		MinMaxLength({
			minLength: options.minLength,
			maxLength: options.maxLength,
			each: options.each,
		}),
	];

	if (options.sanitize) {
		decoratorsToApply.push(Sanitize());
	}

	if (options.trim) {
		decoratorsToApply.push(Trim());
	}

	if (options.required) {
		decoratorsToApply.push(
			IsNotEmpty({
				message: i18nValidationMessage("validation.isNotEmpty"),
				each: options.each,
			}),
		);

		if (options.each) {
			decoratorsToApply.push(
				ArrayNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
				}),
			);
		}
	} else {
		decoratorsToApply.push(IsOptional());
	}

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
