import { Entity, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { User } from './user.entity';
import { Post } from '@entities';

@Entity()
export class Favourite extends BaseEntity {
	@ManyToOne({ entity: () => Post })
	post!: Post;

	@ManyToOne({ entity: () => User })
	user!: User;

	constructor(post: Post, user: User) {
		super();
		this.post = post;
		this.user = user;
	}
}
