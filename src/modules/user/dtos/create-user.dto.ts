import {
	IsString,
	IsEmail,
	MinLength,
	MaxLength,
	IsOptional,
	IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	@MaxLength(255)
	fullName: string;

	@IsOptional()
	@IsString()
	@MinLength(5)
	@MaxLength(255)
	bio: string;

	@IsOptional()
	@IsString()
	@MinLength(5)
	@MaxLength(25)
	website: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	@MaxLength(20)
	username: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password: string;
}
