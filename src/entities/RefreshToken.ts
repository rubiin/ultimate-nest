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
export class RefreshToken {
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

	@ManyToOne({ entity: () => User, onDelete: 'cascade' })
	user: User;

	@Property({
		nullable: false,
		default: false,
		type: 'boolean',
	})
	isRevoked: boolean;

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
