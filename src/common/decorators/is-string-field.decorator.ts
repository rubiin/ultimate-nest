import { applyDecorators } from "@nestjs/common";
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

interface IsStringFieldOptions {
	min?: number;
	max?: number;
	required?: boolean;
	each?: boolean;
}

export function IsStringField(ops?: IsStringFieldOptions) {
	const options = { min: 3, max: 500, required: true, each: false, ...ops };
	const decoratorsToApply = [
		IsString({
			message: i18nValidationMessage("validation.isDataType", {
				type: "string",
			}),
			each: options.each,
		}),
		MinLength(options.min, {
			message: i18nValidationMessage("validation.minLength"),
			each: options.each,
		}),
		MaxLength(options.max, {
			message: i18nValidationMessage("validation.maxLength"),
			each: options.each,
		}),
	];

	options.required
		? decoratorsToApply.push(
				IsNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
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
