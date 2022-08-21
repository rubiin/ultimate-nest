import { IsNotEmpty } from "@nestjs/class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class UserLoginDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	email!: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	password?: string;
}
