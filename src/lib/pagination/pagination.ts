import { stringify } from 'querystring';

import { Pagination } from './pagination.class';
import { IPaginationLinks, IPaginationMeta } from './pagination.interfaces';

/**
 * Pagination helper for response body
 * @see https://github.com/nestjsx/nestjs-typeorm-paginate
 */
export function paginate(
	data: any[],
	totalItems: number,
	currentPage: number,
	limit: number,
	query: any,
	route?: string,
) {
	const totalPages = Math.ceil(totalItems / limit);

	const hasFirstPage = route;
	const hasPreviousPage = route && currentPage > 1;
	const hasNextPage = route && currentPage < totalPages;
	const hasLastPage = route;

	const routes: IPaginationLinks = {
		first: hasFirstPage
			? `${route}?${stringify({ ...query, page: 1 })}`
			: '',
		previous: hasPreviousPage
			? `${route}?${stringify({ ...query, page: currentPage - 1 })}`
			: '',
		next: hasNextPage
			? `${route}?${stringify({ ...query, page: currentPage + 1 })}`
			: '',
		last: hasLastPage
			? `${route}?${stringify({ ...query, page: totalPages })}`
			: '',
	};

	const meta: IPaginationMeta = {
		totalItems,
		itemCount: data.length,
		itemsPerPage: limit,
		totalPages,
		currentPage,
	};

	return new Pagination(data, meta, routes);
}
