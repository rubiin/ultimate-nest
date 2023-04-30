import { EntityData, EntityManager, FilterQuery, FindOptions, Loaded } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/postgresql";
import { BadRequestException } from "@nestjs/common";
import { from, map, Observable, of, switchMap, throwError } from "rxjs";

import { BaseEntity } from "./base.entity";

export class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
	/**
	 *
	 *
	 * @param {T} entity
	 * @return {*}  {EntityManager}
	 * @memberof BaseRepositroy
	 */
	softRemove(entity: T): EntityManager {
		entity.deletedAt = new Date();
		entity.isObsolete = true;
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
		entity.isObsolete = true;

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
					return throwError(() => new BadRequestException("Entity not found."));
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
					return throwError(() => new BadRequestException("Entity not found."));
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
					return throwError(() => new BadRequestException("Entity not found."));
				}

				return this.softRemoveAndFlush(entity);
			}),
		);
	}
}
