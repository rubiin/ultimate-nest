import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "@common/database/base-entity.entity";
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
	user: User;

	@Property()
	isUsed!: boolean;
}
