import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatDto {
	@IsNotEmpty()
	@IsString()
	message!: string;

	@IsString()
	to?: string;
}
