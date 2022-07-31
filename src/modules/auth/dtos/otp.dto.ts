import {PickType} from "@nestjs/mapped-types";
import {IsEmail, IsNotEmpty} from "class-validator";
import {i18nValidationMessage} from "nestjs-i18n";

export class OtpVerifyDto {
    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    otpCode!: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsEmail({}, {message: i18nValidationMessage("validation.INVALID_EMAIL")})
    email!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, ["email"] as const) {
}
