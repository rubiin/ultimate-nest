import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { User } from './user.entity';

@Entity()
export class OtpLog extends BaseEntity {
	@Property({
		nullable: false,
	})
	expiresIn: Date;

	@Property({
		nullable: true,
		length: 20,
	})
	otpCode: string | null;

	@ManyToOne({ entity: () => User, onDelete: 'cascade' })
	user: User;

	@Property({
		nullable: false,
		default: false,
		type: 'boolean',
	})
	isRevoked: boolean;
}
