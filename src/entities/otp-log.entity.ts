import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class OtpLog extends BaseEntity {
	@Property()
	expiresIn!: Date;

	@Property({
		length: 20,
	})
	otpCode?: string;

	@ManyToOne()
	user: Rel<User>;

	@Property()
	isUsed!: boolean;

	constructor(partial?: Partial<OtpLog>) {
		super();
		Object.assign(this, partial);
	}
}
