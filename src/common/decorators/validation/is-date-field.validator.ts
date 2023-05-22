import { DateFieldOptions } from "@common/@types";
import { applyDecorators } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export const IsDateField = (options_?: DateFieldOptions) => {
	const options: DateFieldOptions = { each: false, required: true, ...options_ };
	const decoratorsToApply = [
		IsDateString(
			{ strict: true },
			{
				message: i18nValidationMessage("validation.isDataType", {
					type: "date",
				}),
				each: options.each,
			},
		),
	];

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
