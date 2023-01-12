import { IsEnumField, IsStringField } from "@common/decorators";
import { PostState } from "@common/types";
import { IsUnique } from "@common/validators";
import { Post } from "@entities";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreatePostDto {
	/**
	 * Title of post
	 * @example "Lorem ipsum dolor sit"
	 */

	@IsStringField()
	@IsUnique(() => Post, "title")
	title!: string;

	/**
	 * Description of post
	 * @example "Some paragraph of text"
	 */

	@IsStringField()
	description!: string;

	/**
	 * Content of post
	 * @example "Long paragraph of text"
	 */

	@IsStringField()
	content!: string;

	/**
	 * Tags of post
	 * @example ["fantasy", "adventure"]
	 */

	@IsStringField({ each: true })
	tags!: string[];

	/**
	 * State of post
	 * @example DRAFT
	 */
	@IsEnumField(PostState)
	state: PostState;

	/**
	 * Reading time of post
	 * @example 100 (in minutes)
	 */
	@IsOptional()
	@Type(() => Number)
	@IsInt({
		message: i18nValidationMessage("validation.isDataType", {
			type: "number",
		}),
	})
	@Min(1, { message: i18nValidationMessage("validation.min") })
	readingTime?: number;

	/**
	 * Read count of post
	 * @example 10
	 */
	@IsOptional()
	@Type(() => Number)
	@IsInt({
		message: i18nValidationMessage("validation.isDataType", {
			type: "number",
		}),
	})
	@Min(1, { message: i18nValidationMessage("validation.min") })
	readCount?: number;
}
