import { Roles } from "@common/types/enums/permission.enum";
import { IsPassword } from "@common/validators/is-password.validator";
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from "@nestjs/class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	@MinLength(3, { message: i18nValidationMessage("validation.minLength") })
	@MaxLength(100, { message: i18nValidationMessage("validation.maxLength") })
	username: string;

	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	@MinLength(3, { message: i18nValidationMessage("validation.minLength") })
	@MaxLength(100, { message: i18nValidationMessage("validation.maxLength") })
	firstName: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsString({
		message: i18nValidationMessage("validation.isDataType", {
			type: "string",
		}),
	})
	@MinLength(3, { message: i18nValidationMessage("validation.minLength") })
	@MaxLength(100, { message: i18nValidationMessage("validation.maxLength") })
	lastName: string;

	avatar: string;

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

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@MinLength(8, { message: i18nValidationMessage("validation.minLength") })
	@MaxLength(25, { message: i18nValidationMessage("validation.maxLength") })
	@IsPassword({ message: i18nValidationMessage("validation.isPassword") })
	password: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsArray({
		message: i18nValidationMessage("validation.isDataType", {
			type: "array",
		}),
	})
	@IsEnum(Roles, {
		each: true,
		message: `must be a valid role value,${enumToString(Roles)}`,
	})
	roles: [Roles];
}
