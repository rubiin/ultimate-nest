/* eslint-disable ts/dot-notation */
/* eslint-disable ts/no-floating-promises */

import { Buffer } from "node:buffer";
import type {
  Dictionary,
  EntityManager,
  FilterQuery,
  FindOptions,
  Loaded,
  OrderDefinition,
  QBFilterQuery,
  QueryOrderMap,
} from "@mikro-orm/postgresql";
import {
  EntityRepository,
} from "@mikro-orm/postgresql";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { formatSearch } from "helper-fns";
import type { Observable } from "rxjs";
import { from, map, of, switchMap, throwError } from "rxjs";

import type {
  CursorPaginationResponse,
  OppositeOrder,
  Order,
  PaginateOptions,
  QBCursorPaginationOptions,
  QBOffsetPaginationOptions,
  QueryOrder,
} from "@common/@types";
import {
  CursorType,
  OffsetMeta,
  OffsetPaginationResponse,
  getOppositeOrder,
  getQueryOrder,
} from "@common/@types";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import type { BaseEntity } from "./base.entity";



export class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
  private readonly encoding: BufferEncoding = "base64";

  /**
   * The exists function checks if there are any records that match the given filter query.
   * @param where - The `where` parameter is a filter query that specifies the conditions for the existence check.
   * @returns The method is returning an Observable of type boolean.
   */
  exists(where: QBFilterQuery<T>): Observable<boolean> {
    return from(this.qb().where(where).getCount()).pipe(map(count => count > 0));
  }

  /**
   * Returns the entity name.
   * @returns The entity name as a string.
   */
  getEntityName(): string {
    return this.entityName.toString();
  }

  /**
   * The softRemove function soft deletes the entity and persists the changes to the database.
   * @param entity - The entity to be removed
   * @returns The entityManager
   */
  softRemove(entity: T): EntityManager {
    entity.deletedAt = new Date();
    entity.isDeleted = true;
    this.em.persist(entity);

    return this.em;
  }

  /**
   * Soft removes the entity and flushes the changes to the database.
   * @param entity - The entity to be removed
   * @returns observable of the removed entity
   */
  softRemoveAndFlush(entity: T): Observable<T> {
    entity.deletedAt = new Date();
    entity.isDeleted = true;

    return from(this.em.persistAndFlush(entity)).pipe(map(() => entity));
  }

  /**
   * Replaces the entity with the given entity and persists the changes to the database.
   * @param where - The where clause to use for the update
   * @param options - The options to use for the update
   * @returns An object containing the total number of entities and the entities
   */
  findAndPaginate<Populate extends string = never>(
    where: FilterQuery<T>,
    options?: FindOptions<T, Populate>,
  ): Observable<{ total: number, results: Loaded<T, Populate>[] }> {
    return from(this.findAndCount(where, options)).pipe(
      map(([results, total]) => ({ total, results })),
    );
  }

  /**
   * Returns the removed entity rather than `this`.
   * @param entity - The entity to be removed
   * @returns The removed entity
   */
  delete(entity: T): T {
    this.em.remove(entity);

    return entity;
  }

  /**
   * It finds an entity by the given `where` clause, and if it exists, it deletes it.
   * @param where - This is the where clause to use for the delete.
   * @returns The entity that was deleted
   */
  findAndDelete(where: FilterQuery<T>): Observable<T> {
    return from(this.findOne(where)).pipe(
      switchMap((entity) => {
        if (!entity) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: this.getEntityName() },
                }),
              ),
          );
        }
        this.em.remove(entity);

        return of(entity);
      }),
    );
  }

  /**
   * It finds an entity by the given `where` clause, and if it exists, it soft deletes it.
   * @param where - This is the where clause to use for the soft delete.
   * @returns The entity that was soft deleted.
   */
  findAndSoftDelete(where: FilterQuery<T>): Observable<T> {
    return from(this.findOne(where)).pipe(
      switchMap((entity) => {
        if (!entity) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: this.getEntityName() },
                }),
              ),
          );
        }

        return this.softRemoveAndFlush(entity);
      }),
    );
  }

  /**
   * Gets the where clause filter logic for the query builder pagination methods.
   * @param cursor - The cursor to use for the pagination
   * @param decoded - The decoded cursor
   * @param order - The order to use for the pagination
   * @returns The where clause filter logic
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
   * Takes a base64 cursor and returns the string or number value of it.
   * @param cursor - The base64 cursor
   * @param cursorType - The type of the cursor
   * @returns The decoded cursor
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
          throw new BadRequestException(translate("exception.cursorInvalidDate"));

        return new Date(millisUnix);
      }
      case CursorType.NUMBER: {
        const number = Number.parseInt(string, 10);

        if (Number.isNaN(number))
          throw new BadRequestException(translate("exception.cursorInvalidNumber"));

        return number;
      }
      default: {
        return string;
      }
    }
  }

  /**
   * Takes a date, string or number and returns the base64 representation of it.
   * @param value - The value to encode
   * @returns The base64 encoded value
   */
  encodeCursor(value: Date | string | number): string {
    let string = value.toString();

    if (value instanceof Date)
      string = value.getTime().toString();

    return Buffer.from(string, "utf8").toString(this.encoding);
  }

  /**
   * Makes the order by query for MikroORM orderBy method.
   * @param cursor - The cursor to use for the pagination
   * @param order - The order to use for the pagination
   * @returns The order by query
   */
  private getOrderBy<T>(
    cursor: keyof T,
    order: QueryOrder,
  ): OrderDefinition<T> {
    return {
      [cursor]: order,
    } as QueryOrderMap<T>;
  }

  /**
   * This is a TypeScript function that performs offset pagination on a query builder and returns an
   * observable of the paginated results.
   * @param dto - An object containing two properties:
   * @returns An Observable of OffsetPagination, which contains the results of a query with pagination
   * options applied.
   */
  qbOffsetPagination<T extends Dictionary>(
    dto: QBOffsetPaginationOptions<T>,
  ): Observable<OffsetPaginationResponse<T>> {
    const { qb, pageOptionsDto } = dto;

    const {
      limit,
      offset,
      order,
      sort,
      fields,
      search,
      from: fromDate,
      relations,
      to,
      searchField,
      alias,
    } = pageOptionsDto;
    const selectedFields = [...new Set([...fields, "id"])];

    if (search) {
      qb.andWhere({
        [searchField]: {
          $ilike: formatSearch(search),
        },
      });
    }

    if (relations) {
      for (const relation of relations)
        qb.leftJoinAndSelect(`${alias}.${relation}`, `${alias}_${relation}`);
    }

    if (fromDate) {
      qb.andWhere({
        createdAt: {
          $gte: fromDate,
        },
      });
    }

    if (to) {
      qb.andWhere({
        createdAt: {
          $lte: to,
        },
      });
    }

    qb.orderBy({ [sort]: order.toLowerCase() })
      .limit(limit)
      .select(selectedFields)
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
   * Takes a query builder and returns the entities paginated using cursor pagination.
   * @param dto - An object containing two properties
   * @returns An Observable of CursorPaginationResponse, which contains the results of a query with
   */
  async qbCursorPagination<T extends Dictionary>(
    dto: QBCursorPaginationOptions<T>,
  ): Promise<CursorPaginationResponse<T>> {
    const { qb, pageOptionsDto } = dto;

    const {
      after,
      first,
      search,
      relations,
      alias,
      cursor,
      order,
      cursorType,
      fields,
      withDeleted,
      from: fromDate,
      to,
      searchField,
    } = pageOptionsDto;

    qb.where({
      isDeleted: withDeleted,
    });

    if (search && searchField) {
      qb.andWhere({
        [searchField]: {
          $ilike: formatSearch(search),
        },
      });
    }

    if (relations) {
      for (const relation of relations)
        qb.leftJoinAndSelect(`${alias}.${relation}`, `${alias}_${relation}`);
    }

    if (fromDate) {
      qb.andWhere({
        createdAt: {
          $gte: fromDate,
        },
      });
    }

    if (to) {
      qb.andWhere({
        createdAt: {
          $lte: to,
        },
      });
    }

    let previousCount = 0;
    const stringCursor = String(cursor); // because of runtime issues
    const aliasCursor = `${alias}.${stringCursor}`;
    const selectedFields = [...new Set([...fields, "id"])];

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
      .select(selectedFields)
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
   * The `paginateCursor` function takes in a DTO and returns a paginated response with metadata such as the next cursor,
   * whether there are previous or next pages, and the search term.
   * @param dto - The `dto` parameter is an object that contains the following properties:
   * @returns The function `paginateCursor` returns an object of type `CursorPaginationResponse<T>`.
   */
  private paginateCursor<T>(dto: PaginateOptions<T>): CursorPaginationResponse<T> {
    const { instances, currentCount, previousCount, cursor, first, search } = dto;
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
      const last = instances[length - 1]![cursor] as string | number | Date;

      pages.meta.nextCursor = this.encodeCursor(last);
      pages.meta.hasNextPage = currentCount > first;
      pages.meta.hasPreviousPage = previousCount > 0;
    }

    return pages;
  }

  /**
   * Takes an entity repository and a FilterQuery and returns the paginated entities
   * @param cursor - The cursor to use for the pagination
   * @param first - The number of entities to return
   * @param order - The order to use for the pagination
   * @param repo - The entity repository
   * @param where - The where clause to use for the pagination
   * @param after - The cursor to use for the pagination
   * @param afterCursor - The type of the cursor
   * @returns The paginated entities
   */
  async findAndCountPagination<T extends Dictionary>(
    cursor: keyof T,
    first: number,
    order: QueryOrder,
    repo: EntityRepository<T>,
    where: FilterQuery<T> ,
    after?: string,
    afterCursor: CursorType = CursorType.STRING,
  ): Promise<CursorPaginationResponse<T>> {
    let previousCount = 0;

    if (after) {
      const decoded = this.decodeCursor(after, afterCursor);
      const queryOrder = getQueryOrder(order);
      const oppositeOrder = getOppositeOrder(order);
      const countWhere = where;

      // @ts-expect-error "and is a valid key for FilterQuery"
      countWhere["$and"] = this.getFilters("createdAt", decoded, oppositeOrder);
      previousCount = await repo.count(countWhere);

      // @ts-expect-error "and is a valid key for FilterQuery"
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
