import {
	Entity,
	Property,
	PrimaryKey,
	Unique,
	SerializedPrimaryKey,
	ManyToOne,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { User } from './User.entity';

@Entity()
export class OtpLog {
	@SerializedPrimaryKey()
	@PrimaryKey()
	id: number;

	@Property({ defaultRaw: 'uuid_generate_v4()' })
	idx: string;

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

	@Property({
		nullable: false,
		default: true,
	})
	is_active: boolean;

	@Exclude({ toPlainOnly: true })
	@Property({
		nullable: false,
		default: false,
	})
	is_obsolete: boolean;

	@Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
	createdAt: Date = new Date();

	@Exclude({ toPlainOnly: true })
	@Property({
		defaultRaw: 'CURRENT_TIMESTAMP',
		nullable: true,
		onUpdate: () => new Date(),
	})
	updatedAt?: Date = new Date();
}
