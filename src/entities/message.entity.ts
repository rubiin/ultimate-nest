import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./index";

@Entity()
export class Message extends BaseEntity {
	@Property()
	body!: string;

	@ManyToOne()
	user!: Rel<User>;

	@ManyToOne()
	conversation!: Rel<User>;

	@Property()
	isRead: boolean = false

	@Property()
	readAt?: Date;

	constructor(partial?: Partial<Comment>) {
		super();
		Object.assign(this, partial);
	}
}
