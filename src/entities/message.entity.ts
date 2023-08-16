import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import type { Conversation, User } from "./index";

import { BaseEntity } from "@common/database";

@Entity()
export class Message extends BaseEntity {
  @Property()
body!: string;

  @ManyToOne({
    eager: false,
    index: true,
  })
sender: Rel<User>;

  @ManyToOne({
    eager: false,
    index: true,
  })
conversation!: Rel<Conversation>;

  @Property()
isRead? = false;

  @Property()
readAt?: Date;

  constructor(partial?: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
