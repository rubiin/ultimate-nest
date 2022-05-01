import { IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class UserLoginDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	email!: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.NOT_EMPTY") })
	password?: string;
}
