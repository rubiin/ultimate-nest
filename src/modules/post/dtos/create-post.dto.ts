import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreatePostDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	title: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	description: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	content: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	@IsString({
		message: i18nValidationMessage("validation.INVALID_STRING"),
		each: true,
	})
	@IsArray({ message: i18nValidationMessage("validation.INVALID_ARRAY") })
	tags: string[];
}
