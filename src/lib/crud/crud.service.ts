import type { EntityData, FilterQuery, RequiredEntityData } from "@mikro-orm/core";
import { NotFoundException } from "@nestjs/common";
import type { Observable } from "rxjs";
import { from, map, mergeMap, of, switchMap, throwError } from "rxjs";
import type { Crud, PaginationRequest, PaginationResponse } from "@common/@types";
import { CursorType, PaginationType, QueryOrder } from "@common/@types";
import type { BaseEntity, BaseRepository } from "@common/database";
import type { User } from "@entities";
import { translate } from "@lib/i18n";

export abstract class BaseService<
    Entity extends BaseEntity,
    PRequest extends PaginationRequest,
    CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
    UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> implements Crud<Entity, PRequest> {
  protected searchField: keyof Entity;
  protected queryName = "entity";

  protected constructor(private readonly repository: BaseRepository<Entity>) {}

  /**
   * "Create a new entity from the given DTO, persist it, and return it."
   *
   * The first line creates a new entity from the given DTO. The second line persists the entity and
   * returns a promise. The third line maps the promise to the entity
   * @param dto - The DTO that will be used to create the entity.
   * @param _user - The user that is making the request.
   * @returns An observable of the entity that was created.
   */

  create(dto: CreateDto, _user?: User): Observable<Entity> {
    const entity = this.repository.create(dto);

    return from(this.repository.getEntityManager().persistAndFlush(entity)).pipe(
      map(() => entity),
    );
  }

  /**
   * It takes in a SearchOptionsDto object, and returns an Observable of a Pagination object
   * @param dto - The DTO that will be used to search for the entities.
   * @returns An observable of a pagination object.
   */
  findAll(dto: PaginationRequest): Observable<PaginationResponse<Entity>> {
    const qb = this.repository.createQueryBuilder(this.queryName);

    if (dto.type === PaginationType.CURSOR) {
      // by default, the id is used as cursor

      return from(
        this.repository.qbCursorPagination({
          qb,
          pageOptionsDto: {
            alias: this.queryName,
            cursor: "id",
            cursorType: CursorType.NUMBER,
            order: QueryOrder.ASC,
            searchField: this.searchField,
            ...dto,
          },
        }),
      );
    }

    return this.repository.qbOffsetPagination({
      pageOptionsDto: {
        alias: this.queryName,
        order: QueryOrder.ASC,
        offset: dto.offset,
        searchField: this.searchField,
        ...dto,
      },
      qb,
    });
  }

  /**
   * It returns an observable of type Entity.
   * @param index - The name of the index to search.
   * @returns An observable of type Entity.
   */
  findOne(index: string): Observable<Entity> {
    return from(this.repository.findOne({ idx: index } as FilterQuery<Entity>)).pipe(
      mergeMap((entity) => {
        if (!entity) {
          return throwError(
            () =>
              new NotFoundException(
                translate("exception.itemDoesNotExist", {
                  args: { item: this.repository.getEntityName() },
                }),
              ),
          );
        }

        return of(entity);
      }),
    );
  }

  /**
   * It updates an entity.
   * @param index - The name of the index you want to update.
   * @param dto - The data transfer object that will be used to update the entity.
   * @returns An observable of the entity that was updated.
   */
  update(index: string, dto: UpdateDto): Observable<Entity> {
    return this.findOne(index).pipe(
      switchMap((item) => {
        this.repository.assign(item, dto);

        return from(this.repository.getEntityManager().flush()).pipe(map(() => item));
      }),
    );
  }

  /**
   * It removes an entity from the database
   * @param index - string - The index of the entity to remove.
   * @returns An observable of the entity that was removed.
   */
  remove(index: string): Observable<Entity> {
    return this.findOne(index).pipe(
      switchMap((item) => {
        return this.repository.softRemoveAndFlush(item).pipe(map(() => item));
      }),
    );
  }
}
