import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Order } from './order.entity';

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
		length: 60,
		unique: true,
	})
	email: string;

	@OneToMany(() => Order, order => order.user, {
		eager: true,
		orphanRemoval: true,
	})
	orderItems = new Collection<Order>(this);

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
