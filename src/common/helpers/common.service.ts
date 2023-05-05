import { CursorTypeEnum, QueryOrderEnum } from "@common/@types";
import { IEdge, IPaginated } from "@common/@types/interfaces/pagination.interface";
import { getOppositeOrder, getQueryOrder, tOppositeOrder, tOrderEnum } from "@common/@types/types";
import { Dictionary, FilterQuery } from "@mikro-orm/core";
import { EntityRepository, QueryBuilder } from "@mikro-orm/postgresql";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class CommonService {
	constructor() {}


	  /**
   * Takes a string trims it and makes it lower case to be used in ILike
   */
  public formatSearch(search: string): string {
    return `%${search
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\s\s+/g, ' ')
      .toLowerCase()}%`;
  }

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

	public decodeCursor(
		cursor: string,
		cursorType: CursorTypeEnum = CursorTypeEnum.STRING,
	): string | number | Date {
		const str = Buffer.from(cursor, "base64").toString("utf-8");

		switch (cursorType) {
			case CursorTypeEnum.DATE:
				const millisUnix = parseInt(str, 10);

				if (isNaN(millisUnix))
					throw new BadRequestException("Cursor does not reference a valid date");

				return new Date(millisUnix);
			case CursorTypeEnum.NUMBER:
				const num = parseInt(str, 10);

				if (isNaN(num))
					throw new BadRequestException("Cursor does not reference a valid number");

				return num;
			case CursorTypeEnum.STRING:
			default:
				return str;
		}
	}

	private static encodeCursor(val: Date | string | number): string {
		let str: string;

		if (val instanceof Date) {
			str = val.getTime().toString();
		} else if (typeof val === "number" || typeof val === "bigint") {
			str = val.toString();
		} else {
			str = val;
		}

		return Buffer.from(str, "utf-8").toString("base64");
	}

	private static createEdge<T>(instance: T, cursor: keyof T, innerCursor?: string): IEdge<T> {
		try {
			return {
				node: instance,
				cursor: CommonService.encodeCursor(
					innerCursor ? instance[cursor][innerCursor] : instance[cursor],
				),
			};
		} catch (_) {
			throw new InternalServerErrorException("The given cursor is invalid");
		}
	}

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

	public async queryBuilderPagination<T extends Dictionary>(
		alias: string,
		cursor: keyof T,
		cursorType: CursorTypeEnum,
		first: number,
		order: QueryOrderEnum,
		qb: QueryBuilder<T>,
		after?: string,
		innerCursor?: string,
	): Promise<IPaginated<T>> {
		const strCursor = String(cursor); // because of runtime issues
		const aliasCursor = `${alias}.${strCursor}`;
		let prevCount = 0;

		if (after) {
			const decoded = this.decodeCursor(after, cursorType);
			const oppositeOd = getOppositeOrder(order);
			const tempQb = qb.clone();
			tempQb.andWhere(CommonService.getFilters(cursor, decoded, oppositeOd, innerCursor));
			prevCount = await tempQb.count(aliasCursor, true);

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

		return this.paginate(entities, count, prevCount, cursor, first, innerCursor);
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
	): IPaginated<T> {
		const pages: IPaginated<T> = {
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
		const len = instances.length;

		if (len > 0) {
			for (let i = 0; i < len; i++) {
				pages.edges.push(CommonService.createEdge(instances[i], cursor, innerCursor));
			}
			pages.pageInfo.startCursor = pages.edges[0].cursor;
			pages.pageInfo.endCursor = pages.edges[len - 1].cursor;
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
  ): Promise<IPaginated<T>> {
    let previousCount = 0;

    if (after) {
      const decoded = this.decodeCursor(after, afterCursor);
      const queryOrder = getQueryOrder(order);
      const oppositeOrder = getOppositeOrder(order);
      const countWhere = where;
      countWhere['$and'] = CommonService.getFilters(
        'createdAt',
        decoded,
        oppositeOrder,
        innerCursor,
      );
      previousCount = await repo.count(countWhere);
      where['$and'] = CommonService.getFilters(
        'createdAt',
        decoded,
        queryOrder,
        innerCursor,
      );
    }

    const [entities, count] = await this.throwInternalError(
      repo.findAndCount(where, {
        orderBy: CommonService.getOrderBy(cursor, order, innerCursor),
        limit: first,
      }),
    );

    return this.paginate(
      entities,
      count,
      previousCount,
      cursor,
      first,
      innerCursor,
    );
  }

}
