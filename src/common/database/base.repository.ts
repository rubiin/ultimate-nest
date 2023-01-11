import { EntityManager, FilterQuery, FindOptions, Loaded } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/postgresql";

import { BaseEntity } from "./base-entity.entity";

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
		this.persist(entity);

		return this.em;
	}

	/**
	 *  soft remove
	 *
	 * @param {T} entity
	 * @return {*}  {Promise<T>}
	 * @memberof BaseRepositroy
	 */
	async softRemoveAndFlush(entity: T): Promise<T> {
		entity.deletedAt = new Date();
		entity.isObsolete = true;
		await this.persistAndFlush(entity);

		return entity;
	}

	/**
	 * Replace the return value of {@link EntityRepository.findAndCount} with an
	 * object.
	 * @param where
	 * @param options
	 * @returns
	 */
	async findAndPaginate<Populate extends string = never>(
		where: FilterQuery<T>,
		options?: FindOptions<T, Populate>,
	): Promise<{ total: number; results: Loaded<T, Populate>[] }> {
		const [results, total] = await this.findAndCount(where, options);

		return { total, results };
	}

	/**
	 * Returns the removed entity rather than `this`.
	 * @param entity
	 * @returns
	 */
	delete(entity: T): T {
		this.remove(entity);

		return entity;
	}
}
