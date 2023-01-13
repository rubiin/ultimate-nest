import { IsNumberField, Sanitize } from "@common/decorators";
import { Order } from "@common/types/enums/misc.enum";
import { IsEnum, IsOptional } from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

export class PageOptionsDto {
	/**
	 * Results page you want to retrieve (0..N)
	 */
	@IsNumberField({ required: false })
	readonly page?: number = 1;

	/**
	 * Number of results per page
	 */
	@IsNumberField({ required: false , max: 50})
	readonly limit?: number = 10;

	/**
	 * Sorting order
	 */
	@IsEnum(Order, {
		message: i18nValidationMessage("validation.isEnum", {
			values: enumToString(Order),
		}),
	})
	@IsOptional()
	readonly order?: Order = Order.DESC;

	/**
	 * Sorting criteria
	 */
	@IsOptional()
	@Sanitize()
	readonly sort?: string = "createdAt";

	/**
	 * Search query
	 * @example John
	 */
	@IsOptional()
	@Sanitize()
	readonly search?: string;

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
