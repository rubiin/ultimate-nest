import { BaseEntity } from "@common/database";
import { PostState } from "@common/types";
import {
	ArrayType,
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	EventArgs,
	ManyToOne,
	OneToMany,
	Property,
	Rel,
} from "@mikro-orm/core";
import { slugify } from "helper-fns";

import { Comment } from "./comment.entity";
import { User } from "./user.entity";

@Entity()
export class Post extends BaseEntity {
	@Property()
	slug?: string;

	@Property()
	title!: string;

	@Property()
	description!: string;

	@Property({ type: "text" })
	content!: string;

	@Property({ type: ArrayType })
	tags: string[];

	@Enum({ items: () => PostState })
	state = PostState.DRAFT;

	@Property()
	readingTime = 0;

	@Property()
	readCount = 0;

	@ManyToOne({ eager: false })
	author: Rel<User>;

	@OneToMany(() => Comment, comment => comment.post, {
		eager: false,
		orphanRemoval: true,
	})
	comments = new Collection<Comment>(this);

	@Property()
	favoritesCount = 0;

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword(arguments_: EventArgs<this>) {
		if (arguments_.changeSet?.payload?.title) {
			this.slug = slugify(this.title);
		}
	}

	constructor(partial?: Partial<Post>) {
		super();
		Object.assign(this, partial);
	}
}
