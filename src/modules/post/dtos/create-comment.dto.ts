import { IsString } from "class-validator";

export class CreateCommentDto {
	@IsString()
	readonly body: string;
}
