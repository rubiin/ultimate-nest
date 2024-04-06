import { Entity, Property } from "@mikro-orm/postgresql";
import { BaseEntity } from "@common/database";

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
