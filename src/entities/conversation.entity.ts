import { BaseEntity } from "@common/database";
import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from "@mikro-orm/postgresql";
import { Message, User } from "./index";

@Entity()
export class Conversation extends BaseEntity {
  @Property({ index: true })
  chatName!: string;

  @ManyToMany(() => User, user => user.conversations, { index: true })
  users = new Collection<User>(this);

  @OneToMany(() => Message, message => message.conversation, {
    orphanRemoval: true,
  })
  messages = new Collection<Message>(this);

  constructor(partial?: Partial<Conversation>) {
    super();
    Object.assign(this, partial);
  }
}
