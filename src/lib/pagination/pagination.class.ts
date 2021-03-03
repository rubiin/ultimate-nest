import { Type } from '@nestjs/common';
import { ApiResponse, ApiResponseProperty } from '@nestjs/swagger';
import { IPaginationLinks, IPaginationMeta } from './pagination.interfaces';

export class Pagination<PaginationObject> {
	constructor(
		/**
		 * a list of items to be returned
		 */
		readonly data: PaginationObject[],
		/**
		 * associated meta information (e.g., counts)
		 */
		readonly meta: IPaginationMeta,
		/**
		 * associated links
		 */
		readonly links: IPaginationLinks,
	) {}
}

export function PaginateResponse<T>(classReference: Type<T>): any {
	@ApiResponse({})
	abstract class Pagination<T> {
		@ApiResponseProperty({ type: [classReference] })
		data!: T[];

		@ApiResponseProperty({ type: IPaginationMeta })
		meta!: IPaginationMeta;

		@ApiResponseProperty({ type: IPaginationLinks })
		links!: IPaginationLinks;
	}

	return Pagination as new () => Pagination<T>;
}
