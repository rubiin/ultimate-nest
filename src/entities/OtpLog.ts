import {
	Entity,
	Property,
	PrimaryKey,
	Unique,
	SerializedPrimaryKey,
	ManyToOne,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';

@Entity()
export class OtpLog extends BaseEntity {
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
}
