import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class OtpLog extends BaseEntity {
	@Property()
	expiresIn!: Date;

	@Property({
		length: 20,
		index: true,
	})
	otpCode?: string;

	@ManyToOne({
		eager: false,
		index: true,
	})
	user: Rel<User>;

	@Property()
	isUsed? = false;

	constructor(partial?: Partial<OtpLog>) {
		super();
		Object.assign(this, partial);
	}
}
