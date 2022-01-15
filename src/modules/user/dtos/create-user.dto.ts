import { HelperService } from '@common/helpers/helpers.utils';
import {
	IsString,
	IsEmail,
	MinLength,
	MaxLength,
	IsOptional,
	IsArray,
	IsEnum,
} from 'class-validator';

export class CreateUserDto {
	@IsOptional()
	@IsString()
	@MaxLength(255)
	firstName: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	middleName: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	lastName: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password: string;

}
