import { IsString } from 'class-validator';

export class CreateCategoryDto {
	@IsString()
	name: string;

	@IsString()
	icon: string;

	@IsString()
	image: string;

	@IsString()
	color: string;

	@IsString()
	description: string;
}
