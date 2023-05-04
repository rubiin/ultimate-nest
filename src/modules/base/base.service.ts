import { IBaseService } from "@common/@types";
import { BaseEntity, BaseRepository } from "@common/database";
import { SearchOptionsDto } from "@common/dtos/search.dto";
import { User } from "@entities";
import { PageMetaDto, Pagination } from "@lib/pagination";
import { EntityData, QBFilterQuery, RequiredEntityData } from "@mikro-orm/core";
import { from, map, Observable } from "rxjs";

export abstract class BaseService<
	Entity extends BaseEntity = BaseEntity,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> implements IBaseService
{
	protected search: QBFilterQuery<Entity> = null;
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
	 * @param pageOptionsDto
	 */
	findAll(pageOptionsDto: SearchOptionsDto): Observable<Pagination<Entity>> {
		const { order, limit, sort, offset, search } = pageOptionsDto;
		const qb = this.repository.qb("p").select("p.*");

		if (search) {
			qb.andWhere({ name: { $ilike: `%${search}%` } });
		}

		qb.orderBy({ [sort]: order.toLowerCase() })
			.limit(limit)
			.offset(offset);

		const pagination$ = from(qb.getResultAndCount());

		return pagination$.pipe(
			map(([results, itemCount]) => {
				const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

				return new Pagination(results, pageMetaDto);
			}),
		);
	}

	/**
	 * It returns an observable of type Entity.
	 * @param {string} index - The name of the index to search.
	 */
	findOne(index: string): Observable<Entity> {
		return from(this.repository.findOneOrFail({ idx: index } as any));
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
