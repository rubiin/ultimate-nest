import type { Ref, Rel } from "@mikro-orm/postgresql"
import type { User } from "./user.entity"
import { BaseEntity } from "@common/database"
import { Entity, ManyToOne, Property } from "@mikro-orm/postgresql"

@Entity()
export class PointRedemptionLog extends BaseEntity {
  @Property()
  points!: number

  @Property({ columnType: "numeric(9,2)" })
  amount!: string

  @ManyToOne({ index: true })
  user!: Rel<Ref<User>>

  constructor(partial?: Partial<PointRedemptionLog>) {
    super()
    Object.assign(this, partial)
  }
}
