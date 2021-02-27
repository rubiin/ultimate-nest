import { BaseEntity } from '@common/database/base-entity.entity';
import { Property } from '@mikro-orm/core';
import { Entity } from '@mikro-orm/core';

@Entity()
export class Product extends BaseEntity {
	@Property({
		length: 100,
		unique: true,
	})
	name!: string;

	@Property()
	price: number;
}
