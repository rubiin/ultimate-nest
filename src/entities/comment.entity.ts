import { BaseEntity } from "@common/database/base-entity.entity";
import { HelperService } from "@common/helpers";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { Post, User } from "./index";

@Entity()
export class Comment extends BaseEntity {
	@Property()
	body: string;

	@ManyToOne()
	post: Post;

	@ManyToOne()
	author: User;

	constructor(partial?: Partial<Comment>) {
		super();
		Object.assign(this, partial);
	}

	@Property({ persist: false })
	get self() {
		return HelperService.resourceLink("posts/comments", this.idx);
	}
}
