import { IsNotEmpty } from '@nestjs/class-validator';

export class UserLoginDto {
	@IsNotEmpty()
	email!: string;

	@IsNotEmpty()
	password!: string;
}
