import { EnumFieldOptions as EmailFieldOptions } from "@common/@types";
import { applyDecorators } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export const IsUUIDField = (options_?: EmailFieldOptions) => {
	const options: EmailFieldOptions = {
		each: false,
		required: true,
		...options_,
	};
	const decoratorsToApply = [
		IsUUID("4", {
			message: i18nValidationMessage<I18nTranslations>("validation.isDataType", {
				type: "uuid",
			}),
			each: options.each,
		}),
	];

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
		);
	}

	return applyDecorators(...decoratorsToApply);
};
