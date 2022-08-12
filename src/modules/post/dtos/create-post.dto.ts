import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreatePostDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	title: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	description: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	content: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
		each: true,
	})
	@IsArray({
		message: i18nValidationMessage("validation.isDataType", {
			type: "array",
		}),
	})
	tags: string[];
}
