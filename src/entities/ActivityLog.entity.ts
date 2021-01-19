import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity.entity';
import { User } from './User.entity';

@Entity()
export class ActivityLog extends BaseEntity {
	@Property({
		nullable: true,
		length: 50,
	})
	activityType: string | null;

	@Property({
		nullable: true,
		length: 50,
	})
	loginType: string | null;

	@Property({
		nullable: true,
		length: 50,
	})
	ipAddress: string | null;

	@Property({
		nullable: true,
		length: 50,
	})
	deviceId: string | null;

	@Property({
		nullable: false,
		default: true,
	})
	status: boolean;

	@Property({
		nullable: false,
		default: true,
	})
	loginStatus: boolean;

	@ManyToOne({ entity: () => User, onDelete: 'cascade' })
	user: User;
}
