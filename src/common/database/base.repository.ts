import { EntityData, EntityManager, FilterQuery, FindOptions, Loaded } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/postgresql";
import { BadRequestException } from "@nestjs/common";

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

	/**
	 * It finds an entity by the given `where` clause, and then updates it with the given `update` object
	 * @param where - FilterQuery<T>
	 * @param update - Partial<EntityDTO<Loaded<T>>>
	 * @returns The entity that was updated
	 */
	async findAndUpdate(where: FilterQuery<T>, update: EntityData<T>): Promise<T> {
		const entity = await this.findOne(where);

		if (!entity) {
			throw new BadRequestException("Entity not found");
		}
		this.em.assign(entity, update);
		await this.persistAndFlush(entity);

		return entity;
	}

	/**
	 * It finds an entity by the given `where` clause, and if it exists, it deletes it
	 * @param where - FilterQuery<T>
	 * @returns The entity that was deleted
	 */
	async findAndDelete(where: FilterQuery<T>): Promise<T> {
		const entity = await this.findOne(where);

		if (!entity) {
			throw new BadRequestException("Entity not found");
		}
		this.remove(entity);

		return entity;
	}

	/**
	 * It finds an entity by the given `where` clause, and if it exists, it soft deletes it
	 * @param where - FilterQuery<T>
	 * @returns The entity that was soft deleted.
	 */
	async findAndSoftDelete(where: FilterQuery<T>): Promise<T> {
		const entity = await this.findOne(where);

		if (!entity) {
			throw new BadRequestException("Entity not found");
		}

		return this.softRemoveAndFlush(entity);
	}
}
