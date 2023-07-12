import { ReferralStatus } from "@common/@types";
import { BaseEntity } from "@common/database";
import { Entity, Enum, Index, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class Referral extends BaseEntity {
	@Index()
	@ManyToOne()
	referrer: Rel<User>;

	@Index()
	@Property()
	mobileNumber: string;

	@Index()
	@Enum(() => ReferralStatus)
	status = ReferralStatus.PENDING;
}
