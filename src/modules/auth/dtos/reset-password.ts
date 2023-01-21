import { IsEqualTo, IsPassword } from "@common/validators";
import { PickType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class ResetPasswordDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	otpCode!: string;

	/**
	 * New password of user
	 * @example SomeThingNew7^#%
	 */
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsPassword()
	password!: string;

	/**
	 * New password of user
	 * @example AVeryGoodPassword@&67t75
	 */

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsEqualTo("password")
	confirmPassword!: string;
}

export class ChangePasswordDto extends PickType(ResetPasswordDto, [
	"password",
	"confirmPassword",
] as const) {
	/**
	 * Password of user
	 * @example SomeThingNew7^#%
	 */
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	oldPassword!: string;
}
