import {
	Entity,
	Property,
	PrimaryKey,
	Unique,
	SerializedPrimaryKey,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './BaseEntity.entity';

@Entity()
export class User extends BaseEntity {
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
}
