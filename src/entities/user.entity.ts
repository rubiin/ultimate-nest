import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	OneToMany,
	Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Order } from './order.entity';
import { Exclude } from 'class-transformer';
import { HelperService } from '@common/helpers/helpers.utils';
import { EncryptedType } from '@common/database/mikrorm.encrypted';

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

	@Exclude({ toPlainOnly: true })
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

	@Property({ type: EncryptedType, length: 50 })
	phone: string;

	@Property()
	isAdmin: boolean;

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await HelperService.hashString(this.password);
	}
}
