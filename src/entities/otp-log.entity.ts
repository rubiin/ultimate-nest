import type { Ref } from "@mikro-orm/core";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import type { User } from "./user.entity";

import { BaseEntity } from "@common/database";

@Entity()
export class OtpLog extends BaseEntity {
  @Property()
    expiresIn!: Date;

  @Property({
    length: 20,
    index: true,
  })
    otpCode?: string;

  @ManyToOne({
    eager: false,
    index: true,
  })
    user: Rel<Ref<User>>;

  @Property()
    isUsed? = false;

  constructor(partial?: Partial<OtpLog>) {
    super();
    Object.assign(this, partial);
  }
}
