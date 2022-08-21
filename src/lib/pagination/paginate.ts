import { Logger } from "@nestjs/common";
import { createPaginationObject } from "./create-pagination";
import { Pagination } from "./pagination";
import { IPaginationOptions } from "./pagination-option.interface";

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

const logger = new Logger(Pagination.name);

/**
 * It takes an array of items, and returns a pagination object with the items sliced to the current
 * page, the total number of items, the current page, the number of items per page, and the route
 * @param {T[]} items - The array of items to paginate.
 * @param {IPaginationOptions} options - IPaginationOptions
 * @returns A function that takes in an array of items and an options object and returns a promise that
 * resolves to a pagination object.
 */
export async function paginate<T>(items: T[], options: IPaginationOptions): Promise<Pagination<T>> {
	const [page, limit, route] = resolveOptions(options);

	if (page < 1) {
		return createPaginationObject([], 0, page, limit, route);
	}

	return createPaginationObject<T>(items, items.length, page, limit, route);
}

function resolveOptions(options: IPaginationOptions): [number, number, string] {
	const page = resolveNumericOption(options, "page", DEFAULT_PAGE);
	const limit = resolveNumericOption(options, "limit", DEFAULT_LIMIT);
	const route = options.route;

	return [page, limit, route];
}

function resolveNumericOption(
	options: IPaginationOptions,
	key: "page" | "limit",
	defaultValue: number,
): number {
	const value = options[key];
	const resolvedValue = Number(value);

	if (Number.isInteger(resolvedValue) && resolvedValue >= 0) return resolvedValue;

	logger.warn(
		`Query parameter "${key}" with value "${value}" was resolved as "${resolvedValue}", please validate your query input! Falling back to default "${defaultValue}".`,
	);

	return defaultValue;
}
