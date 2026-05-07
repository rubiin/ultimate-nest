import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/legacy";
import { Opt, Ref, Rel } from "@mikro-orm/postgresql";

import { User } from "./user.entity";

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
