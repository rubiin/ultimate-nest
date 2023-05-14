import { IsDateInFormat, IsStringField } from "@common/decorators";

export class CreateNewsletterDto {
	@IsStringField()
	name!: string;

	@IsStringField()
	content!: string;

	@IsDateInFormat("yyyy-MM-dd")
	sentAt: string;
}
