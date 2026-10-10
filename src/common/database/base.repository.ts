import {
  CursorPaginationOptions,
  CursorPaginationResponse,
  OffsetMeta,
  OffsetPaginationResponse,
  QBOffsetPaginationOptions,
  QueryOrder,
} from "@common/@types";
import { ERROR_CODES } from "@common/constant";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import {
  Cursor,
  CursorError,
  Dictionary,
  EntityManager,
  EntityKey,
  EntityRepository,
  FilterQuery,
  FindByCursorOptions,
  FindOptions,
  IndexFilterQuery,
  Loaded,
  OrderDefinition,
  QBField,
  QBFilterQuery,
  QueryOrderMap,
} from "@mikro-orm/postgresql";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { formatSearch } from "helper-fns";
import { Observable } from "rxjs";
import { from, map, of, switchMap, throwError } from "rxjs";

import { BaseEntity } from "./base.entity";

export class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
  /**
   * The exists function checks if there are any records that match the given filter query.
   * @param where - The `where` parameter is a filter query that specifies the conditions for the existence check.
   * @returns The method is returning an Observable of type boolean.
   */
  exists(where: QBFilterQuery<T>): Observable<boolean> {
    return from(this.qb().where(where).getCount()).pipe(map((count) => count > 0));
  }

  /**
   * Returns the entity name.
   * @returns The entity name as a string.
   */
  getEntityName(): string {
    // `entityName` holds the class/schema reference, not a name, so the metadata
    // is the only reliable source for the string form.
    return this.em.getMetadata(this.entityName).className;
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

    return this.em as EntityManager;
  }

  /**
   * Soft removes the entity and flushes the changes to the database.
   * @param entity - The entity to be removed
   * @returns observable of the removed entity
   */
  softRemoveAndFlush(entity: T): Observable<T> {
    entity.deletedAt = new Date();
    entity.isDeleted = true;

    return from(this.em.persist(entity).flush()).pipe(map(() => entity));
  }

  /**
   * Replaces the entity with the given entity and persists the changes to the database.
   * @param where - The where clause to use for the update
   * @param options - The options to use for the update
   * @returns An object containing the total number of entities and the entities
   */
  findAndPaginate<Populate extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<T> : IndexFilterQuery<T, Using>,
    options?: FindOptions<T, Populate> & { using?: Using | Using[] },
  ): Observable<{ total: number; results: Loaded<T, Populate>[] }> {
    return from(this.findAndCount<Populate, never, never, Using>(where, options)).pipe(
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
   * Makes the order by query for MikroORM orderBy method.
   * @param cursor - The cursor to use for the pagination
   * @param order - The order to use for the pagination
   * @returns The order by query
   */
  private getOrderBy<T>(cursor: keyof T, order: QueryOrder): OrderDefinition<T> {
    return {
      [cursor]: order,
    } as QueryOrderMap<T>;
  }

  /**
   * Orders by the cursor field and breaks ties with the primary key. Without the tie-breaker the
   * order is not total, so rows sharing the cursor value are skipped across pages.
   * @param cursor - The field the client paginates on.
   * @param order - The direction, applied to both keys.
   * @returns The order by query for keyset pagination.
   */
  private getCursorOrderBy<T>(cursor: keyof T, order: QueryOrder): OrderDefinition<T> {
    return {
      [cursor]: order,
      ...(cursor === ("id" as keyof T) ? {} : { id: order }),
    } as QueryOrderMap<T>;
  }

  /**
   * Performs offset pagination on a query builder.
   * @param dto - The query builder plus the validated pagination options.
   * @returns The paginated results together with their offset page metadata.
   */
  async qbOffsetPagination<T extends Dictionary>(
    dto: QBOffsetPaginationOptions<T>,
  ): Promise<OffsetPaginationResponse<T>> {
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
      withDeleted,
    } = pageOptionsDto;
    const selectedFields = [...new Set([...fields, "id"])];

    // QueryBuilder bypasses the entity filters `em.find()` applies, so the
    // soft-delete filter has to be toggled explicitly to honour `withDeleted`.
    await qb.applyFilters({ softDelete: !withDeleted });

    // `select` replaces the field list while `leftJoinAndSelect` appends to it, so the
    // requested columns have to be applied first or the joins are dropped from the result.
    qb.select(selectedFields as EntityKey<T>[]);

    if (search) {
      qb.andWhere({
        [searchField]: {
          $ilike: formatSearch(search),
        },
      } as QBFilterQuery<T>);
    }

    if (relations) {
      for (const relation of relations)
        qb.leftJoinAndSelect(
          `${alias}.${relation}` as QBField<T, string, never>,
          `${alias}_${relation}`,
        );
    }

    if (fromDate) {
      qb.andWhere({
        createdAt: {
          $gte: fromDate,
        },
      } as unknown as QBFilterQuery<T>);
    }

    if (to) {
      qb.andWhere({
        createdAt: {
          $lte: to,
        },
      } as unknown as QBFilterQuery<T>);
    }

    qb.orderBy(this.getOrderBy(sort as keyof T, order))
      .limit(limit)
      .offset(offset);

    const [results, itemCount] = await qb.getResultAndCount();
    const pageMetaDto = new OffsetMeta({ pageOptionsDto, itemCount });

    return new OffsetPaginationResponse(results, pageMetaDto);
  }

  /**
   * Paginates the entities with keyset (cursor) pagination via `findByCursor`.
   * @param options - The validated cursor pagination options.
   * @returns The page of entities together with its cursor metadata.
   */
  async cursorPagination(
    options: CursorPaginationOptions<T>,
  ): Promise<CursorPaginationResponse<T>> {
    const {
      after,
      first,
      search,
      relations,
      cursor,
      order,
      fields,
      withDeleted,
      from: fromDate,
      to,
      searchField,
    } = options;
    const where: Dictionary = {};

    // Only the entity's own top-level relations may be populated: `*` and nested paths like
    // `a.b` would let the client shape the join tree. Unknown names are rejected rather than
    // dropped, so a client asking for data it cannot get finds out instead of silently
    // receiving less.
    if (relations.length > 0) {
      const allowed = new Set<string>(
        this.em.getMetadata(this.entityName).relations.map((property) => property.name),
      );
      const rejected = relations.filter((relation) => !allowed.has(relation));

      if (rejected.length > 0)
        throw new BadRequestException(
          translate("exception.itemDoesNotExist", { args: { item: rejected.join(", ") } }),
        );
    }

    if (search && searchField) where[searchField as string] = { $ilike: formatSearch(search) };

    if (fromDate || to)
      where.createdAt = { ...(fromDate && { $gte: fromDate }), ...(to && { $lte: to }) };

    let page: Cursor<T, never, never, never, false>;

    try {
      page = await this.findByCursor({
        where: where as FilterQuery<T>,
        after,
        first,
        orderBy: this.getCursorOrderBy(cursor, order),
        // the cursor value is read off the last row, so it has to be selected
        fields: (fields.length > 0
          ? [...new Set([...fields, "id", cursor])]
          : undefined) as FindByCursorOptions<T>["fields"],
        populate: relations as unknown as FindByCursorOptions<T>["populate"],
        filters: { softDelete: !withDeleted },
        // the response carries no total, so skip the extra count query
        includeCount: false,
      });
    } catch (error) {
      if (error instanceof CursorError)
        throw new BadRequestException(translate("exception.invalidCursor"), {
          errorCode: ERROR_CODES.CURSOR_INVALID,
        });

      throw error;
    }

    return {
      data: page.items,
      meta: {
        nextCursor: page.endCursor ?? "",
        hasNextPage: page.hasNextPage,
        hasPreviousPage: page.hasPrevPage,
        search: search ?? "",
      },
    };
  }
}
