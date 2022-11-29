import { applyDecorators } from "@nestjs/common";
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { Sanitize } from "./sanitize.decorator";

interface IsStringFieldOptions {
	min?: number;
	max?: number;
	required?: boolean;
	each?: boolean;
}

export function IsStringField(ops?: IsStringFieldOptions) {
	const options = { min: 3, max: 500, required: true, ...ops, each: false };
	const decoratorsToApply = [
		Sanitize(),
		IsString({
			message: i18nValidationMessage("validation.isDataType", {
				type: "string",
			}),
		}),
		MinLength(options.min, { message: i18nValidationMessage("validation.minLength") }),
		MaxLength(options.max, { message: i18nValidationMessage("validation.maxLength") }),
	];

	options.required
		? decoratorsToApply.push(
				IsNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
					each: options.each,
				}),
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
}
