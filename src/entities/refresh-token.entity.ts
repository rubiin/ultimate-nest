import { BaseEntity } from '@common/database/base-entity.entity';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { User } from './user.entity';

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
