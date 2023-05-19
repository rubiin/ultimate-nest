import { PostStateEnum } from "@common/@types";
import { IsEnumField, IsStringField, ToBoolean } from "@common/decorators";
import { IsBoolean, IsNotEmpty, IsUUID } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreatePostDto {
	/**
	 * Title of post
	 * @example "Lorem ipsum dolor sit"
	 */

	@IsStringField()
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

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsUUID("4", {
		each: true,
		message: i18nValidationMessage("validation.isDataType", {
			type: "uuid",
		}),
	})
	tags!: string[];

	/**
	 * tags of post
	 * @example ["c84ab664-d9a9-4b00-b412-bc31b50c7c50","c84ab664-d9a9-4b00-b412-bc31b50c7c50"]
	 */

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsUUID("4", {
		each: true,
		message: i18nValidationMessage("validation.isDataType", {
			type: "uuid",
		}),
	})
	categories!: string[];

	/**
	 * State of post
	 * @example DRAFT
	 */

	@IsEnumField(PostStateEnum, { required: false })
	state: PostStateEnum;

	@ToBoolean()
	@IsBoolean({
		message: i18nValidationMessage("validation.isDataType", {
			type: "boolean",
		}),
	})
	published?: boolean;
}
