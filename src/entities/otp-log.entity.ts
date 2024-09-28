import type { Opt, Ref, Rel } from "@mikro-orm/postgresql"
import type { User } from "./user.entity"
import { BaseEntity } from "@common/database"
import { Entity, ManyToOne, Property } from "@mikro-orm/postgresql"

@Entity()
export class OtpLog extends BaseEntity {
  @Property()
  expiresIn!: Date

  @Property({
    length: 20,
    index: true,
  })
  otpCode?: string

  @ManyToOne({
    index: true,
  })
  user!: Rel<Ref<User>>

  @Property()
  isUsed: boolean & Opt = false

  constructor(partial?: Partial<OtpLog>) {
    super()
    Object.assign(this, partial)
  }
}
