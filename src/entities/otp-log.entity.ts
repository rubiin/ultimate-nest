import { OtpPurpose } from "@common/@types";
import { BaseEntity } from "@common/database";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/decorators/legacy";
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

  // Keeps a code issued for one flow from being redeemed in the other.
  @Enum({ items: () => OtpPurpose })
  purpose: OtpPurpose & Opt = OtpPurpose.RESET_PASSWORD;

  @Property()
  isUsed: boolean & Opt = false;

  constructor(partial?: Partial<OtpLog>) {
    super();
    Object.assign(this, partial);
  }
}
