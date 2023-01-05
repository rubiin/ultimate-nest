import { BaseEntity } from "@common/database/base-entity.entity";
import { Relation } from "@common/types";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";

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
	user: Relation<User>;

	@Property()
	isUsed!: boolean;
}
