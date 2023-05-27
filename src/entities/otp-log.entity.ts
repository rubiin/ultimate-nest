import { BaseEntity } from "@common/database";
import { Entity, Index, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class OtpLog extends BaseEntity {
	@Property()
	expiresIn!: Date;

	@Index()
	@Property({
		length: 20,
	})
	otpCode?: string;

	@ManyToOne({
		eager: false,
	})
	user: Rel<User>;

	@Property()
	isUsed? = false;

	constructor(partial?: Partial<OtpLog>) {
		super();
		Object.assign(this, partial);
	}
}
