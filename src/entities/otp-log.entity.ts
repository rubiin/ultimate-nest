import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/legacy";
import type { Rel } from "@mikro-orm/postgresql";
import { Opt, Ref } from "@mikro-orm/postgresql";

import { User } from "./user.entity";

@Entity()
export class OtpLog extends BaseEntity {
  @Property()
  expiresIn!: Date;

  @Property({
    hidden: true,
    index: true,
    length: 20,
  })
  otpCode?: string;

  @ManyToOne({
    index: true,
  })
  user!: Rel<Ref<User>>;

  @Property()
  isUsed: boolean & Opt = false;

  constructor(partial?: Partial<OtpLog>) {
    super();
    Object.assign(this, partial);
  }
}
