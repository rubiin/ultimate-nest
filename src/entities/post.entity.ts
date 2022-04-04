import {
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
		length: 250,
		nullable: true,
	})
	caption?: string;

	@Property({
		length: 80,
		nullable: true,
	})
	location?: string;

	@Property({
		length: 150,
	})
	file: string;

	@Property({
		default: 0,
	})
	favoritesCount: number;

	// @Property({ type: ArrayType, nullable: true })
	// tagList?: string[] = [];

	@ManyToOne({ entity: () => User })
	user: User;

	@OneToMany(() => Comment, comment => comment.post, {
		eager: true,
		orphanRemoval: true,
	})
	comment = new Collection<Comment>(this);
}
