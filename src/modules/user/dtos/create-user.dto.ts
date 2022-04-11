import { AppRoles } from "@common/constants/app.roles";
import { enumToString } from "@rubiin/js-utils";
import {
	IsString,
	IsEmail,
	MinLength,
	MaxLength,
	IsOptional,
	IsArray,
	IsEnum,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
	@IsOptional()
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	@MaxLength(255, { message: i18nValidationMessage("validation.MAX_LENGTH") })
	firstName: string;

	@IsOptional()
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	@MaxLength(255, { message: i18nValidationMessage("validation.MAX_LENGTH") })
	lastName: string;

	avatar: string;

	@IsEmail({}, { message: i18nValidationMessage("validation.INVALID_EMAIL") })
	email: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	@MinLength(8, { message: i18nValidationMessage("validation.MIN_LENGTH") })
	@MaxLength(128, { message: i18nValidationMessage("validation.MAX_LENGTH") })
	password: string;

	@IsArray({ message: i18nValidationMessage("validation.INVALID_ARRAY") })
	@IsEnum(AppRoles, {
		each: true,
		message: `must be a valid role value,${enumToString(AppRoles)}`,
	})
	roles: [AppRoles];
}
