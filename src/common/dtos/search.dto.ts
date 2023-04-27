import { IsStringField } from "@common/decorators";

import { PageOptionsDto } from "./pagination.dto";

export abstract class SearchOptionsDto extends PageOptionsDto {
	/**
	 * Search query
	 * @example John
	 */
	@IsStringField({ required: false, minLength: 1, maxLength: 50 })
	readonly search?: string;
}
