import { BaseEntity } from '@common/database/base-entity.entity';
import { OneToOne, Property } from '@mikro-orm/core';
import { Entity } from '@mikro-orm/core';
import { Order } from './order.entity';
@Entity()
export class OrderItems extends BaseEntity {
	@Property({
		default: 0,
	})
	quantity: number;

	@OneToOne(() => Order, order => order.orderItem)
	order!: Order;
}
