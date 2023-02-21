import { IsEnumField, IsNumberField, IsStringField } from "@common/decorators";
import { Order } from "@common/@types";

export class PageOptionsDto {
	/**
	 * Results page you want to retrieve (0..N)
	 */
	@IsNumberField({ required: false })
	readonly page: number = 1;

	/**
	 * Number of results per page
	 */
	@IsNumberField({ required: false, max: 50 })
	readonly limit: number = 10;

	/**
	 * Sorting order
	 */
	@IsEnumField(Order, { required: false })
	readonly order: Order = Order.DESC;

	/**
	 * Sorting criteria
	 */
	@IsStringField({ required: false, maxLength: 50 })
	readonly sort: string = "createdAt";

	/**
	 * Search query
	 * @example John
	 */
	@IsStringField({ required: false, maxLength: 50 })
	readonly search?: string;

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
