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

export class CreateUserDto {
	@IsString()
	@MaxLength(255)
	firstName: string;

	@IsString()
	@MaxLength(255)
	lastName: string;

	avatar: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password: string;

	@IsArray()
	@IsEnum(AppRoles, {
		each: true,
		message: `must be a valid role value,${enumToString(AppRoles)}`,
	})
	roles: [AppRoles];
}
