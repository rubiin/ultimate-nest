import {
	IsString,
	MinLength,
	MaxLength,
	IsOptional,
} from '@nestjs/class-validator';

export class CreatePostDto {
	@IsOptional()
	@IsString()
	@MinLength(5)
	@MaxLength(255)
	caption: string;

	// @IsOptional()
	// @IsString()
	// @MinLength(5)
	// @MaxLength(25)
	// tags: string[];

	file: string;
}
