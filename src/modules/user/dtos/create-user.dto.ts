import { AppRoles } from "@common/constants/app.roles";
import { HelperService } from "@common/helpers/helpers.utils";
import {
	IsString,
	IsEmail,
	MinLength,
	MaxLength,
	IsOptional,
	IsArray,
	IsEnum,
} from "class-validator";

export class CreateUserDto {
	@IsOptional()
	@IsString()
	@MaxLength(255)
	firstName: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	lastName: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
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
		message: `must be a valid role value,${HelperService.EnumToString(
			AppRoles,
		)}`,
	})
	roles: [AppRoles];
}
