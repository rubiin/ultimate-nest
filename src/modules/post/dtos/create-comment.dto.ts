import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	@MaxLength(255)
	comment!: string;
}
