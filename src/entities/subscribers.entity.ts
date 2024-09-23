import { BaseEntity } from "@common/database"
import { Entity, Property } from "@mikro-orm/postgresql"

@Entity()
export class Subscriber extends BaseEntity {
  @Property({ index: true, unique: true })
  email!: string

  constructor(partial?: Partial<Subscriber>) {
    super()
    Object.assign(this, partial)
  }
}
