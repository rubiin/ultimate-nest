import { BaseEntity } from '@common/database/base-entity.entity';
import { ManyToOne, OneToOne, Property } from '@mikro-orm/core';
import { Entity } from '@mikro-orm/core';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderItem extends BaseEntity {
	@Property({
		default: 0,
	})
	quantity: number;

	@OneToOne(() => Product, product => product.orderItem, {
		owner: true,
		orphanRemoval: true,
	})
	product!: Product;

	@ManyToOne(() => Order)
	order: Order;

	constructor(quantity: number, product: Product) {
		super();
		this.quantity = quantity;
		this.product = product;
	}
}
