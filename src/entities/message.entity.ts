import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { Conversation, User } from "./index";

@Entity()
export class Message extends BaseEntity {
	@Property()
	body!: string;

	@ManyToOne({
		eager: false,
	})
	sender: Rel<User>;

	@ManyToOne({
		eager: false,
	})
	conversation!: Rel<Conversation>;

	@Property()
	isRead = false;

	@Property()
	readAt?: Date;

	constructor(partial?: Partial<Comment>) {
		super();
		Object.assign(this, partial);
	}
}
