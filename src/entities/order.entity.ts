import { BaseEntity } from '@common/database/base-entity.entity';
import { OneToOne, Property } from '@mikro-orm/core';
import { Entity } from '@mikro-orm/core';
import { OrderItems } from './order-items.entity';
@Entity()
export class Order extends BaseEntity {
	@Property({
		default: 0,
	})
	quantity: number;

	@OneToOne(() => OrderItems, orderItems => orderItems.order, {
		owner: true,
		orphanRemoval: true,
	})
	orderItem!: OrderItems;
}
