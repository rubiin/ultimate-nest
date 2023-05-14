import { BaseEntity } from "@common/database";
import {
	BeforeCreate,
	BeforeUpdate,
	BeforeUpsert,
	Collection,
	Entity,
	EventArgs,
	Index,
	ManyToMany,
	Property,
	Unique,
} from "@mikro-orm/core";
import { slugify } from "helper-fns";

import { Post } from "./post.entity";

@Unique({ properties: ["title"] })
@Entity()
export class Tag extends BaseEntity {
	@Index()
	@Property({
		length: 50,
	})
	title!: string;

	@Property({ columnType: "text" })
	description!: string;

	@Index()
	@Property()
	slug?: string;

	@ManyToMany(() => Post, post => post.tags)
	posts = new Collection<Post>(this);

	constructor(partial?: Partial<Tag>) {
		super();
		Object.assign(this, partial);
	}

	@BeforeCreate()
	@BeforeUpsert()
	@BeforeUpdate()
	generateSlug(arguments_: EventArgs<this>) {
		if (arguments_.changeSet?.payload?.title) {
			this.slug = slugify(this.title);
		}
	}
}
