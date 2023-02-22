import { PostState } from "@common/@types";
import { IsEnumField, IsNumberField, IsStringField } from "@common/decorators";
import { IsUnique } from "@common/validators";
import { Post } from "@entities";

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
	@IsNumberField({ required: false })
	readingTime?: number;
}
