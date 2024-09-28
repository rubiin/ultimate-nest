import type { Ref, Rel } from "@mikro-orm/postgresql"
import type { Post, User } from "./index"
import { BaseEntity } from "@common/database"
import { Entity, ManyToOne, Property } from "@mikro-orm/postgresql"

@Entity()
export class Comment extends BaseEntity {
  @Property()
  body!: string

  @ManyToOne({
    index: true,
  })
  post!: Rel<Ref<Post>>

  @ManyToOne({
    index: true,
  })
  author!: Rel<Ref<User>>

  constructor(partial?: Partial<Comment>) {
    super()
    Object.assign(this, partial)
  }
}
