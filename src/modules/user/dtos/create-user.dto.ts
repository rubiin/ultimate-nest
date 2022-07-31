import {AppRoles} from "@common/constants/app.roles";
import {IsArray, IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength,} from "class-validator";
import {enumToString} from "helper-fns";
import {i18nValidationMessage} from "nestjs-i18n";

export class CreateUserDto {
    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsString({message: i18nValidationMessage("validation.INVALID_STRING")})
    @MinLength(4, {message: i18nValidationMessage("validation.MIN_LENGTH")})
    @MaxLength(128, {message: i18nValidationMessage("validation.MAX_LENGTH")})
    username: string;

    @IsString({message: i18nValidationMessage("validation.INVALID_STRING")})
    @MaxLength(255, {message: i18nValidationMessage("validation.MAX_LENGTH")})
    firstName: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsString({message: i18nValidationMessage("validation.INVALID_STRING")})
    @MaxLength(255, {message: i18nValidationMessage("validation.MAX_LENGTH")})
    lastName: string;

    avatar: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsEmail({}, {message: i18nValidationMessage("validation.INVALID_EMAIL")})
    email: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsString({message: i18nValidationMessage("validation.INVALID_STRING")})
    @MinLength(8, {message: i18nValidationMessage("validation.MIN_LENGTH")})
    @MaxLength(128, {message: i18nValidationMessage("validation.MAX_LENGTH")})
    password: string;

    @IsNotEmpty({message: i18nValidationMessage("validation.NOT_EMPTY")})
    @IsArray({message: i18nValidationMessage("validation.INVALID_ARRAY")})
    @IsEnum(AppRoles, {
        each: true,
        message: `must be a valid role value,${enumToString(AppRoles)}`,
    })
    roles: [AppRoles];
}
