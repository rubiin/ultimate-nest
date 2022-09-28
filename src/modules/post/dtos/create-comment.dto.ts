import { IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateCommentDto {
	/**
	 * Content of comment
	 * @example "This is a comment"
	 */

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	readonly body: string;
}
