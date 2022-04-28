import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

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

	@IsOptional()
	@IsBoolean()
	status: boolean;
}
