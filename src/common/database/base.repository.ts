import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { BaseEntity } from './base-entity.entity';

export class BaseRepositroy<T extends BaseEntity> extends EntityRepository<T> {
	softRemove(entity: T): EntityManager {
		entity.deletedAt = new Date();
		entity.isObsolete = true;
		this.persist(entity);

		return this.em;
	}

	async softRemoveAndFlush(entity: T): Promise<void> {
		entity.deletedAt = new Date();
		entity.isObsolete = true;
		await this.persistAndFlush(entity);
	}
}
