import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity.entity';

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
