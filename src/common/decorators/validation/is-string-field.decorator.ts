import { StringFieldOptions } from "@common/@types";
import { applyDecorators } from "@nestjs/common";
import {
	ArrayMaxSize,
	ArrayMinSize,
	ArrayNotEmpty,
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";
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
		required: true,
		each: false,
		sanitize: true,
		trim: true,
		minLength: 2,
		maxLength: Number.MAX_SAFE_INTEGER,
		arrayMinSize: 0,
		arrayMaxSize: Number.MAX_SAFE_INTEGER,
		...options_,
	};
	const decoratorsToApply = [
		IsString({
			message: i18nValidationMessage<I18nTranslations>("validation.isDataType", {
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
				message: i18nValidationMessage<I18nTranslations>("validation.isNotEmpty"),
				each: options.each,
			}),
		);

		if (options.each) {
			decoratorsToApply.push(
				ArrayNotEmpty({
					message: i18nValidationMessage<I18nTranslations>("validation.isNotEmpty"),
				}),
			);
		}
	} else {
		decoratorsToApply.push(IsOptional());
	}

	if (options.each) {
		decoratorsToApply.push(
			IsArray({
				message: i18nValidationMessage<I18nTranslations>("validation.isDataType", {
					type: "array",
				}),
			}),
			ArrayMaxSize(options.arrayMaxSize),
			ArrayMinSize(options.arrayMinSize),
		);
	}

	return applyDecorators(...decoratorsToApply);
};
