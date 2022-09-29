import { applyDecorators } from "@nestjs/common";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { Sanitize } from "./sanitize.decorator";

export function IsStringMinMaxDecorator(min = 3, max = 255) {
	const decoratorsToApply = [
		Sanitize(),
		IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") }),
		IsString({
			message: i18nValidationMessage("validation.isDataType", {
				type: "string",
			}),
		}),
		MinLength(min, { message: i18nValidationMessage("validation.minLength") }),
		MaxLength(max, { message: i18nValidationMessage("validation.maxLength") }),
	];

	return applyDecorators(...decoratorsToApply);
}
