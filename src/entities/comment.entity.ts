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
post!: Rel<Post>;

  @ManyToOne({
    eager: false,
    index: true,
  })
author!: Rel<User>;

  constructor(partial?: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
