import { IsStringField } from "@common/decorators";

export class CreateCategoryDto {
	@IsStringField()
	title: string;

	@IsStringField()
	description: string;
}
