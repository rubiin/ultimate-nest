import  { Opt, Ref, Rel } from "@mikro-orm/postgresql"
import  { Conversation, User } from "./index"
import { BaseEntity } from "@common/database"
import { Entity, ManyToOne, Property } from "@mikro-orm/postgresql"

@Entity()
export class Message extends BaseEntity {
  @Property()
  body!: string

  @ManyToOne({
    index: true,
  })
  sender!: Rel<Ref<User>>

  @ManyToOne({
    index: true,
  })
  conversation!: Rel<Ref<Conversation>>

  @Property()
  isRead: boolean & Opt = false

  @Property()
  readAt?: Date

  constructor(partial?: Partial<Message>) {
    super()
    Object.assign(this, partial)
  }
}
