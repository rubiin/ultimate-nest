import { PaginationType, QueryOrderEnum } from "@common/@types";
import { IsEnumField, IsNumberField, IsStringField } from "@common/decorators";
import { Allow } from "class-validator";

import { PaginationDto } from "./pagination.dto";

export class OffsetPaginationDto extends PaginationDto {
	@Allow()
	type: PaginationType.OFFSET = PaginationType.OFFSET;
	/**
	 *  The search query
	 */
	@IsStringField({ required: false, minLength: 1, maxLength: 100 })
	search: string;

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
	@IsEnumField(QueryOrderEnum, { required: false })
	readonly order: QueryOrderEnum = QueryOrderEnum.DESC;

	/**
	 * Sorting criteria
	 */
	@IsStringField({ required: false, maxLength: 50 })
	readonly sort: string = "createdAt";

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
