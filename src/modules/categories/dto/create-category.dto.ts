import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	icon: string;

	@IsNotEmpty()
	@IsString()
	image: string;

	@IsNotEmpty()
	@IsString()
	color: string;

	@IsNotEmpty()
	@IsString()
	description: string;
}
