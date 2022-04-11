import { enumToString } from "@rubiin/js-utils";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { PostCategory } from "../enums";

export class CreatePostDto {
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	title: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	slug: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	excerpt: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	content: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	@IsEnum(PostCategory, {
		message: `Invalid option. Valids options are ${enumToString(
			PostCategory,
		)}`,
	})
	category: string;

	@IsString({
		each: true,
		message: i18nValidationMessage("validation.INVALID_STRING"),
	})
	@IsArray({ message: i18nValidationMessage("validation.INVALID_ARRAY") })
	tags: string[];

	@IsOptional()
	@IsBoolean({ message: i18nValidationMessage("validation.INVALID_BOOLEAN") })
	status: boolean;
}
