import { IsStringField } from "@common/decorators";

import { PaginationDto } from "./pagination.dto";

export abstract class SearchDto extends PaginationDto {
	/**
	 *  The search query
	 */
	@IsStringField({ required: false, minLength: 1, maxLength: 100 })
	search?: string;
}
