import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { Conversation, User } from "./index";

@Entity()
export class Message extends BaseEntity {
	@Property()
	body!: string;

	@ManyToOne()
	user!: Rel<User>;

	@ManyToOne()
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
