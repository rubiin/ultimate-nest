import { IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateCommentDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	readonly body: string;
}
