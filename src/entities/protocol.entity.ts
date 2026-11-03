import { BaseEntity } from "@common/database/index.js";
import { Entity, Property } from "@mikro-orm/decorators/legacy";

// use this model to store the protocol

@Entity()
export class Protocol extends BaseEntity {
  @Property()
  otpExpiryInMinutes!: number;

  constructor(partial?: Partial<Protocol>) {
    super();
    Object.assign(this, partial);
  }
}
