import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity.entity';
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
