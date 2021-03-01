import {
	IsNotEmpty,
	IsAlpha,
	IsEmail,
	IsPhoneNumber,
	IsBoolean,
	IsString,
} from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsAlpha('en-Us')
	name: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;

	@IsNotEmpty()
	@IsPhoneNumber('US')
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
