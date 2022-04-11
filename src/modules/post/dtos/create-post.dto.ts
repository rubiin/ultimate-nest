import { enumToString } from "@rubiin/js-utils";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";
import { PostCategory } from "../enums";

export class CreatePostDto {
	@IsString()
	title: string;

	@IsString()
	slug: string;

	@IsString()
	excerpt: string;

	@IsString()
	content: string;

	@IsNotEmpty()
	@IsEnum(PostCategory, {
		message: `Invalid option. Valids options are ${enumToString(
			PostCategory,
		)}`,
	})
	category: string;

	@IsString({ each: true })
	@IsArray()
	tags: string[];

	@IsOptional()
	@IsBoolean()
	status: boolean;
}
