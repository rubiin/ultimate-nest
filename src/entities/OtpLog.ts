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
		nullable: false,
		name: 'expires_in',
	})
	expiresIn: Date;

	@Property({
		nullable: true,
		length: 20,
	})
	otp_code: string | null;

	@ManyToOne({ entity: () => User, onDelete: 'cascade' })
	user: User;

	@Property({
		nullable: false,
		default: false,
		type: 'boolean',
	})
	isRevoked: boolean;

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
