import {
	ArrayType,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Post extends BaseEntity {
	@Property({
		length: 50,
	})
	caption: string;

	@Property({
		length: 50,
	})
	file: string;

	@Property({ type: ArrayType })
	tagList: string[] = [];

	@ManyToOne({ entity: () => User })
	user: User;

	@OneToMany(() => Comment, comment => comment.post, {
		eager: true,
		orphanRemoval: true,
	})
	posts = new Collection<Comment>(this);
}
