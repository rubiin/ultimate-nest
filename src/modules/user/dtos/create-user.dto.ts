import { AppRoles } from "@common/constants/app.roles";
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	@MinLength(4, { message: i18nValidationMessage("validation.MIN_LENGTH") })
	@MaxLength(128, { message: i18nValidationMessage("validation.MAX_LENGTH") })
	userName: string;

	@IsString({ message: i18nValidationMessage("validation.INVALID_STRING") })
	@MaxLength(255, { message: i18nValidationMessage("validation.MAX_LENGTH") })
	firstName: string;

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
