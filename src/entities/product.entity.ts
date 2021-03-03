import { BaseEntity } from '@common/database/base-entity.entity';
import {
	Property,
	Entity,
	ManyToOne,
	ArrayType,
	OneToOne,
} from '@mikro-orm/core';
import { Category } from './category.entity';
import { OrderItem } from './order-items.entity';

@Entity()
export class Product extends BaseEntity {
	@Property({
		length: 100,
		unique: true,
	})
	name!: string;

	@Property({
		length: 150,
		default: '',
	})
	description!: string;

	@Property({
		columnType: 'text',
		default: '',
	})
	richDescription!: string;

	@Property({ default: '' })
	image: string;

	@Property({ type: ArrayType, nullable: true })
	images: string[];

	@Property({ default: '' })
	brand: string;

	@Property({
		default: 0,
	})
	price: number;

	@Property({ default: 0 })
	countInStock!: number;

	@Property({
		default: 0,
	})
	rating: number;

	@Property({
		default: false,
	})
	isFeatured: boolean;

	@OneToOne(() => OrderItem, orderItem => orderItem.product)
	orderItem!: OrderItem;

	@ManyToOne(() => Category)
	category: Category;
}
