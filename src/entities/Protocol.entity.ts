import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity.entity';

@Entity()
export class Protocol extends BaseEntity {
	@Property({
		nullable: false,
		type: 'number',
	})
	loginAttemptnumbererval: number;

	@Property({
		nullable: false,
		type: 'string',
	})
	loginnumberervalUnit: string;

	@Property({
		nullable: false,
		type: 'number',
	})
	loginMaxRetry: number;

	@Property({
		nullable: false,
		type: 'number',
	})
	otpExpiryInMinutes: number;

	@Property({
		nullable: false,
		type: 'number',
	})
	mpinAttemptnumbererval: number;

	@Property({
		nullable: true,
		type: 'string',
	})
	mpinnumberervalUnit: string;

	@Property({
		nullable: true,
		type: 'number',
	})
	mpinMaxRetry: number;
}
