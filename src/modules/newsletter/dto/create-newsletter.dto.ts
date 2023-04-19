import { IsEmail, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewsLetterDto {
	@IsNotEmpty()
	@IsEmail({}, { message: i18nValidationMessage("validation.isEmail") })
	email!: string;
}
