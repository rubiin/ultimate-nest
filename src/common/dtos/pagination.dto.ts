import { IsNumberField, IsStringField } from "@common/decorators";
import { IsBase64 } from "class-validator";

export abstract class PaginationDto {
	/**
	 * The cursor of the page you are requesting
	 */
	@IsStringField({ required: false })
	@IsBase64()
	public after?: string;

	/**
	 * Results page you want to retrieve (0..N)
	 */
	@IsNumberField({ required: false })
	public first = 10;
}
