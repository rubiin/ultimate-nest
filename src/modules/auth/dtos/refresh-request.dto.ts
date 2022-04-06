import { IsNotEmpty } from "class-validator";

export class RefreshRequest {
	@IsNotEmpty()
	refreshToken: string;
}
