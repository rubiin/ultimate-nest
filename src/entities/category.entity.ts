import { BaseEntity } from "@common/database";
import { Collection, Entity, Index, ManyToMany, Property } from "@mikro-orm/core";

import { Post } from "./index";

@Entity()
export class Category extends BaseEntity {
	@Property()
	@Index()
	name!: string;

	@Property()
	description!: string;

	@ManyToMany(() => Post, post => post.categories)
	posts = new Collection<Post>(this);

	constructor(partial?: Partial<Category>) {
		super();
		Object.assign(this, partial);
	}
}
