import { IBaseService } from "@common/@types";
import { BaseEntity, BaseRepository } from "@common/database";
import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { User } from "@entities";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { from, map, Observable } from "rxjs";

export abstract class BaseService<
	Entity extends BaseEntity = BaseEntity,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> implements IBaseService
{
	constructor(private readonly repository: BaseRepository<Entity>) {}

	/**
	 * "Create a new entity from the given DTO, persist it, and return it."
	 *
	 * The first line creates a new entity from the given DTO. The second line persists the entity and
	 * returns a promise. The third line maps the promise to the entity
	 * @param {CreateDto} dto - CreateDto - The DTO that will be used to create the entity.
	 * @param {User} [_user] - The user that is making the request.
	 * @returns Observable<Entity>
	 */

	create(dto: CreateDto, _user?: User): Promise<Entity> | Observable<Entity> {
		const entity = this.repository.create(dto);

		return from(this.repository.persistAndFlush(entity)).pipe(map(() => entity));
	}

	/**
	 * It takes in a PageOptionsDto object, and returns an Observable of a Pagination object
	 * @param {PageOptionsDto}  - PageOptionsDto - This is a class that contains the following properties:
	 * @returns An observable of a pagination object.
	 */
	findAll({
		page,
		order,
		limit,
		sort,
		offset,
		search,
	}: PageOptionsDto): Observable<Pagination<Entity>> {
		const qb = this.repository.qb("p").select("p.*");

		qb.where({ isObsolete: false, isActive: true });

		if (search) {
			qb.andWhere({ name: { $ilike: `%${search}%` } });
		}

		qb.orderBy({ [sort]: order.toLowerCase() })
			.limit(limit)
			.offset(offset);

		const pagination$ = from(qb.getResultAndCount());

		return pagination$.pipe(
			map(([results, total]) => {
				return createPaginationObject<Entity>(results, total, page, limit);
			}),
		);
	}

	/**
	 * It returns an observable of type Entity.
	 * @param {string} index - The name of the index to search.
	 */
	findOne(index: string): Observable<Entity> {
		return from(this.repository.findOneOrFail(index as any));
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
		return from(this.repository.softRemoveAndFlush(index as any)).pipe(map(entity => entity));
	}
}
