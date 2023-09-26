import type { Ref } from "@mikro-orm/core";
import { Entity, Enum, Index, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { ReferralStatus } from "@common/@types";
import { BaseEntity } from "@common/database";
import type { User } from "./user.entity";

@Entity()
export class Referral extends BaseEntity {
  @ManyToOne({
    index: true,
  })
    referrer: Rel<Ref<User>>;

  @Property({
    index: true,
  })
    mobileNumber: string;

  @Index()
  @Enum(() => ReferralStatus)
    status = ReferralStatus.PENDING;
}
