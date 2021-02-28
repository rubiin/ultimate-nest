import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';

@Entity()
export class User extends BaseEntity {
	@Property({
		length: 50,
	})
	firstName: string;

	@Property({
		length: 50,
		nullable: true,
	})
	middleName?: string;

	@Property({
		length: 50,
	})
	lastName: string;

	@Property({
		length: 50,
		unique: true,
	})
	email: string;

	@Property()
	password: string;

	@Property()
	street: string;

	@Property()
	apartment: string;

	@Property()
	city: string;

	@Property()
	zip: string;

	@Property()
	country: string;

	@Property()
	phone: string;

	@Property()
	isAdmin: boolean;
}
