import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment extends BaseEntity {
	@Property({
		length: 250,
	})
	text!: string;

	@ManyToOne({ entity: () => Post })
	post!: Post;

	@ManyToOne({ entity: () => User })
	user!: User;

	constructor(user: User, post: Post, body: string) {
		super();
		this.user = user;
		this.post = post;
		this.text = body;
	}
}
