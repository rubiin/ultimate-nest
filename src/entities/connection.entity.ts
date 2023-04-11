import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

// This will be used for socket io connection to map socket to user

@Entity()
export class SocketConnection extends BaseEntity {
	@Property()
	socketId: string;

	@ManyToOne()
	connectedUser!: Rel<User>;

	constructor(partial?: Partial<SocketConnection>) {
		super();
		Object.assign(this, partial);
	}
}
