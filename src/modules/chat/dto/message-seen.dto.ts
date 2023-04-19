import { IsNotEmpty, IsString } from "class-validator";

export class MessageSeenDto {
	@IsNotEmpty()
	@IsString()
	readonly receiver: string;
}
