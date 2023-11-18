import type { Ref, Rel } from "@mikro-orm/core";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "@common/database";
import type { Post, User } from "./index";

@Entity()
export class Comment extends BaseEntity {
  @Property()
    body!: string;

  @ManyToOne({
    eager: false,
  })
    post!: Rel<Ref<Post>>;

  @ManyToOne({
    eager: false,
    index: true,
  })
    author!: Rel<Ref<User>>;

  constructor(partial?: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
