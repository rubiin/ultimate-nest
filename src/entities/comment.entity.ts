import type { Ref } from "@mikro-orm/core";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import type { Post, User } from "./index";

import { BaseEntity } from "@common/database";

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
