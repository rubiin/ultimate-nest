import { IsEqualTo } from "@common/validators/is-equal-to.validator";
import { IsPassword } from "@common/validators/is-password.validator";
import { PickType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
	@IsNotEmpty()
	otpCode!: string;

	@IsNotEmpty()
	@IsPassword()
	password!: string;

	@IsNotEmpty()
	@IsEqualTo("password")
	confirmPassword!: string;
}

export class ChangePasswordDto extends PickType(ResetPasswordDto, [
	"password",
	"confirmPassword",
] as const) {
	@IsNotEmpty()
	currentPassword!: string;
}
