import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	OneToMany,
	Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Exclude } from 'class-transformer';
import { HelperService } from '@common/helpers/helpers.utils';
import { Post } from './post.entity';

@Entity()
export class User extends BaseEntity {
	@Property({
		length: 50,
	})
	fullName: string;

	@Property({
		length: 250,
		nullable: true,
	})
	bio?: string;

	@Property({
		length: 50,
		nullable: true,
	})
	website?: string;

	@Property({
		length: 50,
		nullable: true,
	})
	avatar?: string;

	@Property({
		length: 60,
		unique: true,
	})
	email: string;

	@OneToMany(() => Post, post => post.user, { hidden: true })
	posts = new Collection<Post>(this);

	@Property({
		length: 50,
	})
	username: string;

	@Exclude({ toPlainOnly: true })
	@Property()
	password: string;

	@Property({
		default: 0,
	})
	postCount: number;

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await HelperService.hashString(this.password);
	}
}
