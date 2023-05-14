import { IsEmail, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class SubscribeNewsletterDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsEmail(
		{},
		{
			message: i18nValidationMessage("validation.isDataType", {
				type: "email",
			}),
		},
	)
	email: string;
}
