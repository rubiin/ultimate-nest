import { BaseEntity } from "@common/database";
import { Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";

import { Message, User } from "./index";

@Entity()
export class Conversation extends BaseEntity {
	@Property()
	name!: string;

	@ManyToMany(() => User, user => user.conversations)
	users = new Collection<User>(this);

	@OneToMany(() => Message, message => message.conversation)
	messages = new Collection<Message>(this);

	constructor(partial?: Partial<Comment>) {
		super();
		Object.assign(this, partial);
	}
}
