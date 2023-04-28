import { BaseEntity } from "@common/database";
import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	EventArgs,
	ManyToMany,
	Property,
	Unique,
} from "@mikro-orm/core";
import { slugify } from "helper-fns";

import { Post } from "./post.entity";

@Unique({ properties: ["title"] })
@Entity()
export class Tag extends BaseEntity {
	@Property({
		length: 50,
	})
	title!: string;

	@Property()
	description!: string;

	@Property()
	slug?: string;

	@ManyToMany(() => Post, post => post.tags)
	posts = new Collection<Post>(this);

	@BeforeCreate()
	@BeforeUpdate()
	generateSlug(arguments_: EventArgs<this>) {
		if (arguments_.changeSet?.payload?.title) {
			this.slug = slugify(this.title);
		}
	}

	constructor(partial?: Partial<Tag>) {
		super();
		Object.assign(this, partial);
	}
}
