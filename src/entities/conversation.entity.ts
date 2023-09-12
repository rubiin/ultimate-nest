import { Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { Message, User } from "./index";

import { BaseEntity } from "@common/database";

@Entity()
export class Conversation extends BaseEntity {
  @Property({ index: true })
    chatName: string;

  @ManyToMany(() => User, user => user.conversations, { index: true })
    users = new Collection<User>(this);

  @OneToMany(() => Message, message => message.conversation, {
    orphanRemoval: true,
    nullable: true,
  })
    messages = new Collection<Message>(this);

  constructor(partial?: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
