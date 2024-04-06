import type { Opt, Ref } from "@mikro-orm/postgresql";
import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
  Rel,
} from "@mikro-orm/postgresql";
import { ReferralStatus } from "@common/@types";
import { BaseEntity } from "@common/database";
import type { User } from "./user.entity";

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

  @Index()
  @Enum(() => ReferralStatus)
  status: ReferralStatus & Opt = ReferralStatus.PENDING;

  constructor(partial?: Partial<Referral>) {
    super();
    Object.assign(this, partial);
  }
}
