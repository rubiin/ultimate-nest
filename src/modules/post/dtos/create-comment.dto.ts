import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateCommentDto {
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	readonly body: string;
}
