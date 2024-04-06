import { BaseEntity } from "@common/database";
import type { Opt, Ref } from "@mikro-orm/postgresql";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/postgresql";
import type { Conversation, User } from "./index";

@Entity()
export class Message extends BaseEntity {
  @Property()
  body!: string;

  @ManyToOne({
    index: true,
  })
  sender!: Rel<Ref<User>>;

  @ManyToOne({
    index: true,
  })
  conversation!: Rel<Ref<Conversation>>;

  @Property()
  isRead: boolean & Opt = false;

  @Property()
  readAt?: Date;

  constructor(partial?: Partial<Message>) {
    super();
    Object.assign(this, partial);
  }
}
