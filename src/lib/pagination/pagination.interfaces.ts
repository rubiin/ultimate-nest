import { ApiResponseProperty } from '@nestjs/swagger';

export interface IPaginationOptions {
	/**
	 * the amount of items to be requested per page
	 */
	limit: number;
	/**
	 * the page that is requested
	 */
	page: number;
	/**
	 * a basic route for generating links (i.e., WITHOUT query params)
	 */
	route?: string;
}

export abstract class IPaginationMeta {
	/**
	 * the amount of items on this specific page
	 */
	@ApiResponseProperty({ example: 10 })
	itemCount!: number;
	/**
	 * the total amount of items
	 */
	@ApiResponseProperty({ example: 20 })
	totalItems!: number;
	/**
	 * the amount of items that were requested per page
	 */
	@ApiResponseProperty({ example: 10 })
	itemsPerPage!: number;
	/**
	 * the total amount of pages in this paginator
	 */
	@ApiResponseProperty({ example: 5 })
	totalPages!: number;
	/**
	 * the current page this paginator "points" to
	 */
	@ApiResponseProperty({ example: 1 })
	currentPage!: number;
}

export abstract class IPaginationLinks {
	/**
	 * a link to the "first" page
	 */
	@ApiResponseProperty({ example: 'http://cats.com/cats?limit=10&page=1' })
	first?: string;
	/**
	 * a link to the "previous" page
	 */
	@ApiResponseProperty({ example: 'http://cats.com/cats?limit=10&page=2' })
	previous?: string;
	/**
	 * a link to the "next" page
	 */
	@ApiResponseProperty({ example: 'http://cats.com/cats?limit=10&page=3' })
	next?: string;
	/**
	 * a link to the "last" page
	 */
	@ApiResponseProperty({ example: 'http://cats.com/cats?limit=10&page=5' })
	last?: string;
}
