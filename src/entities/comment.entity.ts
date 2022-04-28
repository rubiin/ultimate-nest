import { BaseEntity } from "@common/database/base-entity.entity";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
export class Comment extends BaseEntity {
	@Property()
	body: string;

	@ManyToOne()
	article: Post;

	@ManyToOne()
	author: User;

	constructor(author: User, article: Post, body: string) {
		super();
		this.author = author;
		this.article = article;
		this.body = body;
	}
}
