import {
	CursorType,
	IPaginateOptions,
	IQBCursorPaginationOptions,
	IQBOffsetPaginationOptions,
	QueryOrder,
} from "@common/@types";
import { CursorPaginationResponse } from "@common/@types/cursor.pagination";
import { OffsetMeta, OffsetPaginationResponse } from "@common/@types/offset.pagination";
import { getOppositeOrder, getQueryOrder, OppositeOrder, Order } from "@common/@types/types";
import {
	Dictionary,
	EntityData,
	EntityManager,
	EntityName,
	FilterQuery,
	FindOptions,
	Loaded,
} from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/postgresql";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { from, map, Observable, of, switchMap, throwError } from "rxjs";

import { BaseEntity } from "./base.entity";

export class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
	private readonly encoding: BufferEncoding = "base64";

	getEntityName(): EntityName<T> {
		return this.entityName;
	}

	/**
	 *
	 *
	 * @param {T} entity
	 * @return {*}  {EntityManager}
	 * @memberof BaseRepositroy
	 */
	softRemove(entity: T): EntityManager {
		entity.deletedAt = new Date();
		entity.isDeleted = true;
		this.em.persist(entity);

		return this.em;
	}

	/**
	 *  soft remove
	 *
	 * @param {T} entity
	 * @return {*}  {Promise<T>}
	 * @memberof BaseRepositroy
	 */
	softRemoveAndFlush(entity: T): Observable<T> {
		entity.deletedAt = new Date();
		entity.isDeleted = true;

		return from(this.em.persistAndFlush(entity)).pipe(map(() => entity));
	}

	/**
	 * Replace the return value of {@link EntityRepository.findAndCount} with an
	 * object.
	 * @param where
	 * @param options
	 * @returns
	 */
	findAndPaginate<Populate extends string = never>(
		where: FilterQuery<T>,
		options?: FindOptions<T, Populate>,
	): Observable<{ total: number; results: Loaded<T, Populate>[] }> {
		return from(this.findAndCount(where, options)).pipe(
			map(([results, total]) => ({ total, results })),
		);
	}

	/**
	 * Returns the removed entity rather than `this`.
	 * @param entity
	 * @returns
	 */
	delete(entity: T): T {
		this.em.remove(entity);

		return entity;
	}

	/**
	 * It finds an entity by the given `where` clause, and then updates it with the given `update` object
	 * @param where - FilterQuery<T>
	 * @param update - Partial<EntityDTO<Loaded<T>>>
	 * @returns The entity that was updated
	 */
	findAndUpdate(where: FilterQuery<T>, update: EntityData<T>): Observable<T> {
		return from(this.findOne(where)).pipe(
			switchMap(entity => {
				if (!entity) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t(
									"exception.itemDoesNotExist",
									{
										args: { item: this.getEntityName() },
									},
								),
							),
					);
				}
				this.em.assign(entity, update);

				return from(this.em.persistAndFlush(entity)).pipe(map(() => entity));
			}),
		);
	}

	/**
	 * It finds an entity by the given `where` clause, and if it exists, it deletes it
	 * @param where - FilterQuery<T>
	 * @returns The entity that was deleted
	 */
	findAndDelete(where: FilterQuery<T>): Observable<T> {
		return from(this.findOne(where)).pipe(
			switchMap(entity => {
				if (!entity) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t(
									"exception.itemDoesNotExist",
									{
										args: { item: this.getEntityName() },
									},
								),
							),
					);
				}
				this.em.remove(entity);

				return of(entity);
			}),
		);
	}

	/**
	 * It finds an entity by the given `where` clause, and if it exists, it soft deletes it
	 * @param where - FilterQuery<T>
	 * @returns The entity that was soft deleted.
	 */
	findAndSoftDelete(where: FilterQuery<T>): Observable<T> {
		return from(this.findOne(where)).pipe(
			switchMap(entity => {
				if (!entity) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t(
									"exception.itemDoesNotExist",
									{
										args: { item: this.getEntityName() },
									},
								),
							),
					);
				}

				return this.softRemoveAndFlush(entity);
			}),
		);
	}

	/**
	 * Gets the where clause filter logic for the query builder pagination
	 */
	private getFilters<T>(
		cursor: keyof T,
		decoded: string | number | Date,
		order: Order | OppositeOrder,
	): FilterQuery<Dictionary<T>> {
		return {
			[cursor]: {
				[order]: decoded,
			},
		};
	}

	/**
	 * Takes a base64 cursor and returns the string or number value
	 */
	decodeCursor(
		cursor: string,
		cursorType: CursorType = CursorType.STRING,
	): string | number | Date {
		const string = Buffer.from(cursor, this.encoding).toString("utf8");

		switch (cursorType) {
			case CursorType.DATE: {
				const millisUnix = Number.parseInt(string, 10);

				if (Number.isNaN(millisUnix))
					throw new BadRequestException(
						I18nContext.current<I18nTranslations>()!.t("exception.cursorInvalidDate"),
					);

				return new Date(millisUnix);
			}
			case CursorType.NUMBER: {
				const number = Number.parseInt(string, 10);

				if (Number.isNaN(number))
					throw new BadRequestException(
						I18nContext.current<I18nTranslations>()!.t("exception.cursorInvalidNumber"),
					);

				return number;
			}
			default: {
				return string;
			}
		}
	}
	/**
	 * Takes a date, string or number and returns the base64
	 * representation of it
	 */
	encodeCursor(value: Date | string | number): string {
		let string = value.toString();

		if (value instanceof Date) {
			string = value.getTime().toString();
		}

		return Buffer.from(string, "utf8").toString(this.encoding);
	}

	/**
	 * Makes the order by query for MikroORM orderBy method.
	 */
	private getOrderBy<T>(
		cursor: keyof T,
		order: QueryOrder,
	): Record<string, QueryOrder | Record<string, QueryOrder>> {
		return {
			[cursor]: order,
		};
	}

	/**
	 * This is a TypeScript function that performs offset pagination on a query builder and returns an
	 * observable of the paginated results.
	 * @param dto - An object containing two properties:
	 * @returns An Observable of OffsetPagination, which contains the results of a query with pagination
	 * options applied.
	 */
	qbOffsetPagination<T extends Dictionary>(
		dto: IQBOffsetPaginationOptions<T>,
	): Observable<OffsetPaginationResponse<T>> {
		const { qb, pageOptionsDto } = dto;

		const { limit, offset, order, sort } = pageOptionsDto;

		qb.orderBy({ [sort]: order.toLowerCase() })
			.limit(limit)
			.offset(offset);

		const pagination$ = from(qb.getResultAndCount());

		return pagination$.pipe(
			map(([results, itemCount]) => {
				const pageMetaDto = new OffsetMeta({ pageOptionsDto, itemCount });

				return new OffsetPaginationResponse(results, pageMetaDto);
			}),
		);
	}

	/**
	 * Takes a query builder and returns the entities paginated using cursor pagination
	 */
	async qbCursorPagination<T extends Dictionary>({
		alias,
		cursor,
		cursorType,
		first,
		order,
		qb,
		after,
		fields,
		search,
	}: IQBCursorPaginationOptions<T>): Promise<CursorPaginationResponse<T>> {
		let previousCount = 0;
		const stringCursor = String(cursor); // because of runtime issues
		const aliasCursor = `${alias}.${stringCursor}`;

		if (after) {
			const decoded = this.decodeCursor(after, cursorType);
			const oppositeOd = getOppositeOrder(order);
			const temporaryQb = qb.clone();

			temporaryQb.andWhere(this.getFilters(cursor, decoded, oppositeOd));
			previousCount = await temporaryQb.count(aliasCursor, true);

			const normalOd = getQueryOrder(order);

			qb.andWhere(this.getFilters(cursor, decoded, normalOd));
		}

		const [entities, count]: [T[], number] = await qb
			.select(fields)
			.orderBy(this.getOrderBy(cursor, order))
			.limit(first)
			.getResultAndCount();

		return this.paginateCursor({
			instances: entities,
			currentCount: count,
			previousCount,
			cursor,
			first,
			search,
		});
	}

	/**
	 * Takes an entity array and returns the paginated type of that entity array
	 */
	paginateCursor<T>({
		instances,
		currentCount,
		previousCount,
		cursor,
		first,
		search,
	}: IPaginateOptions<T>): CursorPaginationResponse<T> {
		const pages: CursorPaginationResponse<T> = {
			data: instances,
			meta: {
				nextCursor: "",
				hasPreviousPage: false,
				hasNextPage: false,
				search: search ?? "",
			},
		};
		const length = instances.length;

		if (length > 0) {
			const last = instances[length - 1][cursor] as string | number | Date;

			pages.meta.nextCursor = this.encodeCursor(last);
			pages.meta.hasNextPage = currentCount > first;
			pages.meta.hasPreviousPage = previousCount > 0;
		}

		return pages;
	}

	/**
	 * Takes an entity repository and a FilterQuery and returns the paginated
	 * entities
	 */
	async findAndCountPagination<T extends Dictionary>(
		cursor: keyof T,
		first: number,
		order: QueryOrder,
		repo: EntityRepository<T>,
		where: FilterQuery<T>,
		after?: string,
		afterCursor: CursorType = CursorType.STRING,
	): Promise<CursorPaginationResponse<T>> {
		let previousCount = 0;

		if (after) {
			const decoded = this.decodeCursor(after, afterCursor);
			const queryOrder = getQueryOrder(order);
			const oppositeOrder = getOppositeOrder(order);
			const countWhere = where;

			countWhere["$and"] = this.getFilters("createdAt", decoded, oppositeOrder);
			previousCount = await repo.count(countWhere);
			where["$and"] = this.getFilters("createdAt", decoded, queryOrder);
		}

		const [entities, count] = await repo.findAndCount(where, {
			orderBy: this.getOrderBy(cursor, order),
			limit: first,
		});

		return this.paginateCursor({
			instances: entities,
			currentCount: count,
			previousCount,
			cursor,
			first,
		});
	}
}
