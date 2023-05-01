import { BaseEntity } from "@common/database";
import { Collection, Entity, Index, ManyToMany, OneToMany, Property } from "@mikro-orm/core";

import { Message, User } from "./index";

@Entity()
export class Conversation extends BaseEntity {
	@Index()
	@Property()
	chatName: string;

	@Index()
	@ManyToMany(() => User, user => user.conversations)
	users = new Collection<User>(this);

	@OneToMany(() => Message, message => message.conversation, {
		orphanRemoval: true,
		nullable: true,
	})
	messages = new Collection<Message>(this);

	constructor(partial?: Partial<Comment>) {
		super();
		Object.assign(this, partial);
	}
}
