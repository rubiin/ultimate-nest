import { IPaginationLinks, IPaginationMeta } from "./pagination-option.interface";
import { Pagination } from "./pagination";

/**
 * It takes an array of items, a total number of items, the current page, the limit, and an optional
 * route, and returns a pagination object
 * @param {T[]} items - The items to be paginated.
 * @param {number} totalItems - The total number of items in the database.
 * @param {number} currentPage - The current page number
 * @param {number} limit - The number of items to return per page.
 * @param {string} [route] - The route to the endpoint.
 * @returns A new instance of the Pagination class.
 */
export function createPaginationObject<T>(
	items: T[],
	totalItems: number,
	currentPage: number,
	limit: number,
	route?: string,
): Pagination<T> {
	const totalPages = Math.ceil(totalItems / limit);

	const hasFirstPage = route;
	const hasPreviousPage = route && currentPage > 1;
	const hasNextPage = route && currentPage < totalPages;
	const hasLastPage = route && totalPages > 0;

	const symbol = route && new RegExp(/\?/).test(route) ? "&" : "?";

	const routes: IPaginationLinks = {
		first: hasFirstPage ? `${route}${symbol}limit=${limit}` : "",
		previous: hasPreviousPage ? `${route}${symbol}page=${currentPage - 1}&limit=${limit}` : "",
		next: hasNextPage ? `${route}${symbol}page=${currentPage + 1}&limit=${limit}` : "",
		last: hasLastPage ? `${route}${symbol}page=${totalPages}&limit=${limit}` : "",
	};

	const meta: IPaginationMeta = {
		totalItems: totalItems,
		itemCount: items.length,
		itemsPerPage: limit,
		totalPages: totalPages,
		currentPage: currentPage,
	};

	return new Pagination(meta, items, route && routes);
}
