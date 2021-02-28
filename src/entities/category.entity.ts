import { BaseEntity } from '@common/database/base-entity.entity';
import { Property, Entity, OneToMany, Collection } from '@mikro-orm/core';
import { Product } from './product.entity';
@Entity()
export class Category extends BaseEntity {
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

	@Property({ default: '' })
	icon: string;

	@Property({ default: '' })
	image: string;

	@Property({ default: '' })
	color: string;

	@OneToMany(() => Product, product => product.category)
	product = new Collection<Product>(this);
}
