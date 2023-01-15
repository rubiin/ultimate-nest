import { IsEqualTo, IsPassword } from "@common/validators";
import { PickType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class ResetPasswordDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	otpCode!: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsPassword()
	password!: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsEqualTo("password")
	confirmPassword!: string;
}

export class ChangePasswordDto extends PickType(ResetPasswordDto, [
	"password",
	"confirmPassword",
] as const) {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	currentPassword!: string;
}
