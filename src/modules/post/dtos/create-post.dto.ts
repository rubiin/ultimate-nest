import { IsArray, IsString } from "class-validator";

export class CreatePostDto {
	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsString()
	content: string;

	@IsString({ each: true })
	@IsArray()
	tags: string[];
}
