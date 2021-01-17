import { Entity, Property, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity.entity';
import { User } from './User.entity';

@Entity()
export class ActivityLog extends BaseEntity {
	@Property({
		nullable: true,
		length: 50,
	})
	activity_type: string | null;

	@Property({
		nullable: true,
		length: 50,
	})
	login_type: string | null;

	@Property({
		nullable: true,
		length: 50,
	})
	ip_address: string | null;

	@Property({
		nullable: true,
		length: 50,
	})
	device_id: string | null;

	@Property({
		nullable: false,
		default: true,
	})
	status: boolean;

	@Property({
		nullable: false,
		default: true,
	})
	login_status: boolean;

	@ManyToOne({ entity: () => User, onDelete: 'cascade' })
	user: User;
}
