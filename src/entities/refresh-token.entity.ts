import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core'

import type { User } from './user.entity'
import { BaseEntity } from '@common/database'

@Entity()
export class RefreshToken extends BaseEntity {
  @Property()
expiresIn!: Date

  @ManyToOne({
    eager: false,
  })
user: Rel<User>

  @Property()
isRevoked? = false

  constructor(partial?: Partial<RefreshToken>) {
    super()
    Object.assign(this, partial)
  }
}
