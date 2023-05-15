import { IsDateField, IsStringField } from "@common/decorators";

export class CreateNewsletterDto {
	/**
	 * name of newsletter
	 * @example "React Newsletter"
	 */
	@IsStringField()
	name!: string;

	/**
	 * content of newsletter
	 * @example "React Newsletter"
	 */
	@IsStringField()
	content!: string;

	/**
	 * Send date of newsletter
	 * @example 2020-06-07T14:34:08.700Z
	 */
	@IsDateField()
	sentAt!: string;
}
