import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { Conversation } from "./index";

@Entity()
export class Message extends BaseEntity {
	@Property()
	body!: string;

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
