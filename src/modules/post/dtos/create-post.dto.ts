import { IsArray, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreatePostDto {
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	title: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	description: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	content: string;

	@IsString({
		message: i18nValidationMessage("validation.INVALID_STRING"),
		each: true,
	})
	@IsArray({ message: i18nValidationMessage("validation.INVALID_ARRAY") })
	tags: string[];
}
