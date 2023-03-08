import { IsStringField } from "@common/decorators";

export class CreateTagDto {
	@IsStringField()
	title: string;

	@IsStringField()
	description: string;

  @IsStringField()
  tags: string[];

}
