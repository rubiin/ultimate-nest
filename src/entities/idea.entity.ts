import { BaseEntity } from '@common/database/base-entity.entity';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

@Entity()
export class Idea extends BaseEntity {
	@Property({
		length: 50,
	})
	idea!: string;

	@Property({
		length: 100,
	})
	description!: string;
}
