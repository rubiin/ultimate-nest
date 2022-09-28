import { PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class OtpVerifyDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	otpCode!: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsEmail(
		{},
		{
			message: i18nValidationMessage("validation.isDataType", {
				type: "email",
			}),
		},
	)
	email!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, ["email"] as const) {}
