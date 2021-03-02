import {
	IsNotEmpty,
	IsAlpha,
	IsEmail,
	IsPhoneNumber,
	IsBoolean,
	IsString,
	IsOptional,
} from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsAlpha('en-US')
	firstName: string;

	@IsOptional()
	@IsAlpha('en-US')
	middleName: string;

	@IsNotEmpty()
	@IsAlpha('en-US')
	lastName: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;

	@IsNotEmpty()
	@IsPhoneNumber('AU')
	phone: string;

	@IsNotEmpty()
	@IsBoolean()
	isAdmin: boolean;

	@IsNotEmpty()
	@IsString()
	street: string;

	@IsNotEmpty()
	@IsString()
	apartment: string;

	@IsNotEmpty()
	@IsString()
	zip: string;

	@IsNotEmpty()
	@IsString()
	city: string;

	@IsNotEmpty()
	@IsString()
	country: string;
}
