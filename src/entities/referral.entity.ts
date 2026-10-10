import { ReferralStatus } from "@common/@types";
import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property, Enum } from "@mikro-orm/decorators/legacy";
import type { Rel } from "@mikro-orm/postgresql";
import { Opt, Ref } from "@mikro-orm/postgresql";

import { User } from "./user.entity";
@Entity()
export class Referral extends BaseEntity {
  @ManyToOne({
    index: true,
  })
  referrer!: Rel<Ref<User>>;

  @Property({
    index: true,
  })
  mobileNumber!: string;

  @Enum({ index: true, items: () => ReferralStatus })
  status: ReferralStatus & Opt = ReferralStatus.PENDING;

  constructor(partial?: Partial<Referral>) {
    super();
    Object.assign(this, partial);
  }
}
