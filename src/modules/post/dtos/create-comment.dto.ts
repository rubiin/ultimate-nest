import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	@MaxLength(255)
	comment!: string;
}

export class EditCommentDto extends CreateCommentDto {}
