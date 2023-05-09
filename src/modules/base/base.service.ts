import { CursorTypeEnum, IBaseService, QueryOrderEnum } from "@common/@types";
import { PaginationClass } from "@common/@types/pagination.class";
import { BaseEntity, BaseRepository } from "@common/database";
import { SearchDto } from "@common/dtos/search.dto";
import { HelperService } from "@common/helpers";
import { User } from "@entities";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { NotFoundException } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { from, map, mergeMap, Observable, of, throwError } from "rxjs";

export abstract class BaseService<
	Entity extends BaseEntity = BaseEntity,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> implements IBaseService
{
	protected searchField: keyof Entity = null;
	protected queryName = "entity";

	protected constructor(private readonly repository: BaseRepository<Entity>) {}

	/**
	 * "Create a new entity from the given DTO, persist it, and return it."
	 *
	 * The first line creates a new entity from the given DTO. The second line persists the entity and
	 * returns a promise. The third line maps the promise to the entity
	 * @param dto - The DTO that will be used to create the entity.
	 * @param {User} [_user] - The user that is making the request.
	 * @returns Observable<Entity>
	 */

	create(dto: CreateDto, _user?: User): Observable<Entity> {
		const entity = this.repository.create(dto);

		return from(this.repository.getEntityManager().persistAndFlush(entity)).pipe(
			map(() => entity),
		);
	}

	/**
	 * It takes in a SearchOptionsDto object, and returns an Observable of a Pagination object
	 * @returns An observable of a pagination object.
	 * @param SearchDto - The DTO that will be used to search for the entities.
	 */
	findAll(dto: SearchDto): Observable<PaginationClass<Entity>> {
		const { first, after, search } = dto;
		const qb = this.repository.createQueryBuilder(this.queryName);

		if (search && this.searchField) {
			qb.andWhere({
				[this.searchField]: {
					$ilike: HelperService.formatSearch(search),
				},
			});
		}

		// by default, the id is used as cursor

		return from(
			this.repository.queryBuilderPagination({
				alias: this.queryName,
				cursor: "id",
				cursorType: CursorTypeEnum.NUMBER,
				first,
				order: QueryOrderEnum.ASC,
				qb,
				after,
			}),
		);
	}

	/**
	 * It returns an observable of type Entity.
	 * @param {string} index - The name of the index to search.
	 */
	findOne(index: string): Observable<Entity> {
		return from(this.repository.findOne({ idx: index } as any)).pipe(
			mergeMap(entity => {
				if (!entity) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t(
									"exception.itemDoesNotExist",
									{
										args: { item: this.repository.getEntityName() },
									},
								),
							),
					);
				}

				return of(entity);
			}),
		);
	}

	/**
	 * It updates an entity.
	 * @param {string} index - The name of the index you want to update.
	 * @param {UpdateDto} dto - The data transfer object that will be used to update the entity.
	 */
	update(index: string, dto: UpdateDto): Observable<Entity> {
		return from(this.repository.findAndUpdate(index as any, dto));
	}

	/**
	 * It removes an entity from the database
	 * @param {string} index - string - The index of the entity to remove.
	 * @returns An observable of the entity that was removed.
	 */
	remove(index: string): Observable<Entity> {
		return this.repository.softRemoveAndFlush(index as any).pipe(map(entity => entity));
	}
}
