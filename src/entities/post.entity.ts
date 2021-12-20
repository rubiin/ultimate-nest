import {
	ArrayType,
	BeforeCreate,
	BeforeUpdate,
	Entity,
	ManyToOne,
	Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { User } from './user.entity';
import { HelperService } from '@common/helpers/helpers.utils';

@Entity()
export class Post extends BaseEntity {
	@Property()
	slug!: string;

	@Property({
		length: 150,
	})
	title!: string;

	@Property({
		length: 250,
	})
	excerpt?: string;

	@Property()
	content!: string;

	@Property({
		length: 100,
		nullable: true,
	})
	category: string;

	@Property({ type: ArrayType })
	tags: string[];

	@ManyToOne(() => User, { eager: true })
	author: User;

	@BeforeCreate()
	@BeforeUpdate()
	async generateSlug() {
		this.slug = HelperService.generateSlug(this.slug);
	}
}
