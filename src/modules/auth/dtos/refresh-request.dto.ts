import { IsNotEmpty } from '@nestjs/class-validator';

export class RefreshRequest {
	@IsNotEmpty()
	refreshToken: string;
}
