import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
	@IsNotEmpty()
	public email?: string;

	@IsNotEmpty()
	public password?: string;
}
