import { applyDecorators } from "@nestjs/common";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { Sanitize } from "./sanitize.decorator";
import { IsOptional } from "@common/validators/custom-optional.validator";

export function IsStringMinMaxDecorator(required = true, min = 3, max = 255) {
	const decoratorsToApply = [
		Sanitize(),
		IsString({
			message: i18nValidationMessage("validation.isDataType", {
				type: "string",
			}),
		}),
		MinLength(min, { message: i18nValidationMessage("validation.minLength") }),
		MaxLength(max, { message: i18nValidationMessage("validation.maxLength") }),
	];

	required
		? decoratorsToApply.push(
				IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") }),
		  )
		: decoratorsToApply.push(IsOptional());

	return applyDecorators(...decoratorsToApply);
}
