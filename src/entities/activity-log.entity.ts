import { BaseEntity } from "@common/database";
import { Entity, Index, ManyToOne, Property, Rel } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class ActivityLog extends BaseEntity {
	@Property()
	activityType?: string;

	@Property()
	loginType?: string;

	@Property()
	ipAddress?: string;

	@Property()
	deviceId?: string;

	@Property()
	status = true;

	@Property()
	loginStatus = true;

	@Index()
	@ManyToOne({
		eager: false,
	})
	user!: Rel<User>;

	constructor(partial?: Partial<ActivityLog>) {
		super();
		Object.assign(this, partial);
	}
}
