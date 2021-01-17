import {
	Entity,
	SerializedPrimaryKey,
	PrimaryKey,
	Property,
	ManyToOne,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';

@Entity()
export class RefreshToken extends BaseEntity {
	@Property({
		nullable: false,
		name: 'expires_in',
	})
	expiresIn: Date;

	@ManyToOne({ entity: () => User, onDelete: 'cascade' })
	user: User;

	@Property({
		nullable: false,
		default: false,
		type: 'boolean',
	})
	isRevoked: boolean;
}
