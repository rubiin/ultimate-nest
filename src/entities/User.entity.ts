import {
	Entity,
	Property,
	PrimaryKey,
	Unique,
	SerializedPrimaryKey,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
	@SerializedPrimaryKey()
	@PrimaryKey()
	id: number;

	@Property({ defaultRaw: 'uuid_generate_v4()' })
	idx: string;

	@Property({
		type: 'string',
		length: 50,
	})
	first_name: string;

	@Property({
		type: 'string',
		length: 50,
		nullable: true,
	})
	middle_name?: string;

	@Property({
		type: 'string',
		length: 50,
	})
	last_name: string;

	@Unique()
	@Property({
		type: 'string',
		length: 50,
	})
	username: string;

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

	@Property({
		defaultRaw: 'CURRENT_TIMESTAMP',
		nullable: true,
		onUpdate: () => new Date(),
	})
	updatedAt?: Date = new Date();
}
