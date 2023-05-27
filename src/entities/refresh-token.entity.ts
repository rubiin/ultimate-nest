import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class RefreshToken extends BaseEntity {
	@Property()
	expiresIn!: Date;

	@ManyToOne({
		eager: false,
	})
	user: Rel<User>;

	@Property()
	isRevoked? = false;

	constructor(partial?: Partial<RefreshToken>) {
		super();
		Object.assign(this, partial);
	}
}
