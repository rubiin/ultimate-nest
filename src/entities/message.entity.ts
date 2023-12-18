import { BaseEntity } from "@common/database";
import type { Ref } from "@mikro-orm/postgresql";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/postgresql";
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
