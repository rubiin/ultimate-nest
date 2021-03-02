import { BaseEntity } from '@common/database/base-entity.entity';
import { Collection, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { Entity } from '@mikro-orm/core';
import { OrderItem } from './order-items.entity';
import { User } from './user.entity';
@Entity()
export class Order extends BaseEntity {
	@Property()
	shippingAddress1: string;

	@Property()
	shippingAddress2: string;

	@Property()
	city: string;

	@Property()
	zip: string;

	@Property()
	country: string;

	@Property()
	phone: string;

	@Property({
		default: 'PENDING',
	})
	status: string;

	@Property({
		nullable: true,
	})
	totalPrice: number;

	@OneToMany(() => OrderItem, orderItems => orderItems.order, {
		eager: true,
		orphanRemoval: true,
	})
	orderItems = new Collection<OrderItem>(this);

	@ManyToOne(() => User)
	user: User;

	@Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
	dateOrdered: Date = new Date();

	constructor(data: {
		shippingAddress1: string;
		shippingAddress2: string;
		zip: string;
		city: string;
		country: string;
		phone: string;
		totalPrice: number;
		orderItems: any;
		user: User;
	}) {
		super();
		this.zip = data.zip;
		this.city = data.city;
		this.country = data.country;
		this.phone = data.phone;
		this.totalPrice = data.totalPrice;
		this.orderItems = data.orderItems;
		this.user = data.user;
	}
}
