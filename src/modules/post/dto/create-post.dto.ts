import { PostCategory } from '@common/constants/post-category.enum';
import { HelperService } from '@common/helpers/helpers.utils';
import {
	IsNotEmpty,
	IsString,
	IsBoolean,
	IsEnum,
	IsArray,
	IsOptional,
} from 'class-validator';

export class CreatePostDto {
	@IsString()
	title: string;

	@IsString()
	slug: string;

	@IsString()
	excerpt: string;

	@IsString()
	content: string;

	@IsNotEmpty()
	@IsEnum(PostCategory, {
		message: `Invalid option. Valids options are ${HelperService.enumToString(
			PostCategory
		)}`,
	})
	category: string;

	@IsString({ each: true })
	@IsArray()
	tags: string[];

	@IsOptional()
	@IsBoolean()
	status: boolean;
}
