import { BaseEntity } from "@common/database";
import type { Ref } from "@mikro-orm/core";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import type { Conversation, User } from "./index";

@Entity()
export class Message extends BaseEntity {
  @Property()
    body!: string;

  @ManyToOne({
    eager: false,
    index: true,
  })
    sender!: Rel<Ref<User>>;

  @ManyToOne({
    eager: false,
    index: true,
  })
    conversation!: Rel<Ref<Conversation>>;

  @Property()
    isRead? = false;

  @Property()
    readAt?: Date;

  constructor(partial?: Partial<Message>) {
    super();
    Object.assign(this, partial);
  }
}
