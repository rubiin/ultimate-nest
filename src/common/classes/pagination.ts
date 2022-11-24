import { Order } from "@common/types/enums/misc.enum";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

export class PageOptionsDto {
	/**
	 * Results page you want to retrieve (0..N)
	 */
	@Type(() => Number)
	@IsInt({
		message: i18nValidationMessage("validation.isDataType", {
			type: "number",
		}),
	})
	@Min(1, { message: i18nValidationMessage("validation.min") })
	@IsOptional()
	readonly page?: number = 1;

	/**
	 * Number of results per page
	 */
	@Type(() => Number)
	@IsInt({
		message: i18nValidationMessage("validation.isDataType", {
			type: "number",
		}),
	})
	@Min(1, { message: i18nValidationMessage("validation.min") })
	@Max(50, { message: i18nValidationMessage("validation.max") })
	@IsOptional()
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
	readonly sort?: string = "createdAt";

	/**
	 * Search query
	 * @example John
	 */
	@IsOptional()
	readonly search?: string;

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
