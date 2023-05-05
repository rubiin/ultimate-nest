import { CursorTypeEnum, QueryOrderEnum } from "@common/@types";
import { Edge, Paginated } from "@common/@types/pagination.class";
import { getOppositeOrder, getQueryOrder, tOppositeOrder, tOrderEnum } from "@common/@types/types";
import { Dictionary, FilterQuery } from "@mikro-orm/core";
import { EntityRepository, QueryBuilder } from "@mikro-orm/postgresql";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class CommonService {
	/**
	 * Takes a string trims it and makes it lower case to be used in ILike
	 */
	public formatSearch(search: string): string {
		return `%${search.trim().replace(/\n/g, " ").replace(/\s\s+/g, " ").toLowerCase()}%`;
	}

	/**
	 * Gets the where clause filter logic for the query builder pagination
	 */
	private static getFilters<T>(
		cursor: keyof T,
		decoded: string | number | Date,
		order: tOrderEnum | tOppositeOrder,
		innerCursor?: string,
	): FilterQuery<Dictionary<T>> {
		return innerCursor
			? {
					[cursor]: {
						[innerCursor]: {
							[order]: decoded,
						},
					},
			  }
			: {
					[cursor]: {
						[order]: decoded,
					},
			  };
	}

	/**
	 * Takes a base64 cursor and returns the string or number value
	 */
	public decodeCursor(
		cursor: string,
		cursorType: CursorTypeEnum = CursorTypeEnum.STRING,
	): string | number | Date {
		const string_ = Buffer.from(cursor, "base64").toString("utf8");

		switch (cursorType) {
			case CursorTypeEnum.DATE: {
				const millisUnix = Number.parseInt(string_, 10);

				if (Number.isNaN(millisUnix))
					throw new BadRequestException("Cursor does not reference a valid date");

				return new Date(millisUnix);
			}
			case CursorTypeEnum.NUMBER: {
				const number_ = Number.parseInt(string_, 10);

				if (Number.isNaN(number_))
					throw new BadRequestException("Cursor does not reference a valid number");

				return number_;
			}
			default: {
				return string_;
			}
		}
	}
	/**
	 * Takes a date, string or number and returns the base64
	 * representation of it
	 */
	private static encodeCursor(value: Date | string | number): string {
		let string_: string;

		if (value instanceof Date) {
			string_ = value.getTime().toString();
		} else if (typeof value === "number" || typeof value === "bigint") {
			string_ = value.toString();
		} else {
			string_ = value;
		}

		return Buffer.from(string_, "utf8").toString("base64");
	}

	/**
	 * Takes an instance, the cursor key and a innerCursor,
	 * and generates a GraphQL edge
	 */
	private static createEdge<T>(instance: T, cursor: keyof T, innerCursor?: string): Edge<T> {
		try {
			return {
				node: instance,
				cursor: CommonService.encodeCursor(
					innerCursor ? instance[cursor][innerCursor] : instance[cursor],
				),
			};
		} catch {
			throw new InternalServerErrorException("The given cursor is invalid");
		}
	}

	/**
	 * Makes the order by query for MikroORM orderBy method.
	 */
	private static getOrderBy<T>(
		cursor: keyof T,
		order: QueryOrderEnum,
		innerCursor?: string,
	): Record<string, QueryOrderEnum | Record<string, QueryOrderEnum>> {
		return innerCursor
			? {
					[cursor]: {
						[innerCursor]: order,
					},
			  }
			: {
					[cursor]: order,
			  };
	}

	/**
	 * Takes a query builder and returns the entities paginated
	 */
	public async queryBuilderPagination<T extends Dictionary>(
		alias: string,
		cursor: keyof T,
		cursorType: CursorTypeEnum,
		first: number,
		order: QueryOrderEnum,
		qb: QueryBuilder<T>,
		after?: string,
		innerCursor?: string,
	): Promise<Paginated<T>> {
		const stringCursor = String(cursor); // because of runtime issues
		const aliasCursor = `${alias}.${stringCursor}`;
		let previousCount = 0;

		if (after) {
			const decoded = this.decodeCursor(after, cursorType);
			const oppositeOd = getOppositeOrder(order);
			const temporaryQb = qb.clone();

			temporaryQb.andWhere(
				CommonService.getFilters(cursor, decoded, oppositeOd, innerCursor),
			);
			previousCount = await temporaryQb.count(aliasCursor, true);

			const normalOd = getQueryOrder(order);

			qb.andWhere(CommonService.getFilters(cursor, decoded, normalOd, innerCursor));
		}

		const cqb = qb.clone();
		const [count, entities]: [number, T[]] = await this.throwInternalError(
			Promise.all([
				cqb.count(aliasCursor, true),
				qb
					.select(`${alias}.*`)
					.orderBy(CommonService.getOrderBy(cursor, order, innerCursor))
					.limit(first)
					.getResult(),
			]),
		);

		return this.paginate(entities, count, previousCount, cursor, first, innerCursor);
	}

	/**
	 * Function to abstract throwing internal server exception
	 */
	public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
		try {
			return await promise;
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}

	/**
	 * Takes an entity array and returns the paginated type of that entity array
	 * It uses cursor pagination as recommended in https://relay.dev/graphql/connections.htm
	 */
	public paginate<T>(
		instances: T[],
		currentCount: number,
		previousCount: number,
		cursor: keyof T,
		first: number,
		innerCursor?: string,
	): Paginated<T> {
		const pages: Paginated<T> = {
			currentCount,
			previousCount,
			edges: [],
			pageInfo: {
				endCursor: "",
				startCursor: "",
				hasPreviousPage: false,
				hasNextPage: false,
			},
		};
		const length = instances.length;

		if (length > 0) {
			for (let index = 0; index < length; index++) {
				pages.edges.push(CommonService.createEdge(instances[index], cursor, innerCursor));
			}
			pages.pageInfo.startCursor = pages.edges[0].cursor;
			pages.pageInfo.endCursor = pages.edges[length - 1].cursor;
			pages.pageInfo.hasNextPage = currentCount > first;
			pages.pageInfo.hasPreviousPage = previousCount > 0;
		}

		return pages;
	}

	/**
	 * Takes an entity repository and a FilterQuery and returns the paginated
	 * entities
	 */
	public async findAndCountPagination<T extends Dictionary>(
		cursor: keyof T,
		first: number,
		order: QueryOrderEnum,
		repo: EntityRepository<T>,
		where: FilterQuery<T>,
		after?: string,
		afterCursor: CursorTypeEnum = CursorTypeEnum.STRING,
		innerCursor?: string,
	): Promise<Paginated<T>> {
		let previousCount = 0;

		if (after) {
			const decoded = this.decodeCursor(after, afterCursor);
			const queryOrder = getQueryOrder(order);
			const oppositeOrder = getOppositeOrder(order);
			const countWhere = where;

			countWhere["$and"] = CommonService.getFilters(
				"createdAt",
				decoded,
				oppositeOrder,
				innerCursor,
			);
			previousCount = await repo.count(countWhere);
			where["$and"] = CommonService.getFilters("createdAt", decoded, queryOrder, innerCursor);
		}

		const [entities, count] = await this.throwInternalError(
			repo.findAndCount(where, {
				orderBy: CommonService.getOrderBy(cursor, order, innerCursor),
				limit: first,
			}),
		);

		return this.paginate(entities, count, previousCount, cursor, first, innerCursor);
	}
}
