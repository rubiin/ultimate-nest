import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity.entity';

@Entity()
export class User extends BaseEntity {
	@Property({
		type: 'string',
		length: 50,
	})
	firstName: string;

	@Property({
		type: 'string',
		length: 50,
		nullable: true,
	})
	middleName?: string;

	@Property({
		type: 'string',
		length: 50,
	})
	lastName: string;

	@Unique()
	@Property({
		type: 'string',
		length: 50,
	})
	username: string;
}
