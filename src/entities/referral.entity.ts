import type { Opt, Ref, Rel } from "@mikro-orm/postgresql"
import type { User } from "./user.entity"
import { ReferralStatus } from "@common/@types"
import { BaseEntity } from "@common/database"
import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
} from "@mikro-orm/postgresql"

@Entity()
export class Referral extends BaseEntity {
  @ManyToOne({
    index: true,
  })
  referrer!: Rel<Ref<User>>

  @Property({
    index: true,
  })
  mobileNumber!: string

  @Index()
  @Enum(() => ReferralStatus)
  status: ReferralStatus & Opt = ReferralStatus.PENDING

  constructor(partial?: Partial<Referral>) {
    super()
    Object.assign(this, partial)
  }
}
