import { BaseEntity } from "@common/database/base-entity.entity";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class ActivityLog extends BaseEntity {
	@Property({
		length: 50,
	})
	activityType?: string;

	@Property({
		length: 50,
	})
	loginType?: string;

	@Property({
		length: 50,
	})
	ipAddress?: string;

	@Property({
		length: 50,
	})
	deviceId?: string;

	@Property()
	status = true;

	@Property()
	loginStatus = true;

	@ManyToOne()
	user!: User;
}
