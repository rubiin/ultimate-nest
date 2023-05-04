import { IsEnumField, IsNumberField, IsStringField } from "@common/decorators";
import { QueryOrder } from "@mikro-orm/core/enums";

export abstract class PageOptionsDto {
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
	@IsEnumField(QueryOrder, { required: false })
	readonly order: QueryOrder = QueryOrder.DESC;

	/**
	 * Sorting criteria
	 */
	@IsStringField({ required: false, maxLength: 50 })
	readonly sort: string = "createdAt";

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
