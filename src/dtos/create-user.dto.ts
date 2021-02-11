import {
	IsAlpha,
	IsAlphanumeric,
	IsNotEmpty,
	IsOptional,
} from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsAlphanumeric()
	username!: string;

	@IsNotEmpty()
	@IsAlpha()
	firstName!: string;

	@IsOptional()
	@IsAlpha()
	middleName?: string;

	@IsNotEmpty()
	@IsAlpha()
	lastName!: string;
}
