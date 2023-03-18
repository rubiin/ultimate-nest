import { PostState } from "@common/@types";
import { IsEnumField, IsStringField } from "@common/decorators";
import { IsUnique } from "@common/validators";
import { Post } from "@entities";
import { IsUUID } from "class-validator";

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
	 * tags of post
	 * @example ["c84ab664-d9a9-4b00-b412-bc31b50c7c50","c84ab664-d9a9-4b00-b412-bc31b50c7c50"]
	 */

	@IsUUID("4", { each: true })
	tags!: string[];

	/**
	 * State of post
	 * @example DRAFT
	 */
	@IsEnumField(PostState, { required: false })
	state: PostState;
}
