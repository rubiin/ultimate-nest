import { IPaginationLinks, IPaginationMeta } from "./pagination-option.interface";

export class Pagination<PaginationObject> {
	constructor(
		/**
		 * associated meta information (e.g., counts)
		 */
		public readonly meta: IPaginationMeta,
		/**
		 * a list of items to be returned
		 */
		public readonly items: PaginationObject[],
		/**
		 * associated links
		 */
		public readonly links?: IPaginationLinks,
	) {}
}
