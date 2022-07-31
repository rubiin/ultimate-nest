import {IsEqualTo} from "@common/validators/is-equal-to.validator";
import {IsPassword} from "@common/validators/is-password.validator";
import {PickType} from "@nestjs/mapped-types";
import {IsNotEmpty} from "class-validator";
import {i18nValidationMessage} from "nestjs-i18n";

export class ResetPasswordDto {
    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    otpCode!: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsPassword()
    password!: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsEqualTo("password")
    confirmPassword!: string;
}

export class ChangePasswordDto extends PickType(ResetPasswordDto, [
    "password",
    "confirmPassword",
] as const) {
    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    currentPassword!: string;
}
