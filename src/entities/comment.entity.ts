import { BaseEntity } from "@common/database/base-entity.entity";
import { Relation } from "@common/types";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { Post, User } from "./index";

@Entity()
export class Comment extends BaseEntity {
	@Property()
	body!: string;

	@ManyToOne()
	post!: Relation<Post>;

	@ManyToOne()
	author!: Relation<User>;

	constructor(partial?: Partial<Comment>) {
		super();
		Object.assign(this, partial);
	}
}
