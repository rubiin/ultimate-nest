import { BaseEntity } from "@common/database";
import { Entity, Property } from "@mikro-orm/core";

// use this model to store the protocol

@Entity()
export class Protocol extends BaseEntity {
	@Property()
	loginAttemptnumbererval!: number;

	@Property()
	loginnumberervalUnit!: string;

	@Property()
	loginMaxRetry!: number;

	@Property()
	otpExpiryInMinutes!: number;

	constructor(partial?: Partial<Protocol>) {
		super();
		Object.assign(this, partial);
	}
}
