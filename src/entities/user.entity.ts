import type { FilterQuery } from "@mikro-orm/postgresql";
import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Collection,
  Embeddable,
  Embedded,
  Entity,
  Enum,
  EventArgs,
  Index,
  ManyToMany,
  OneToMany,
  Property,
  wrap,
} from "@mikro-orm/postgresql";
import { Roles } from "@common/@types";
import { BaseEntity } from "@common/database";
import { HelperService } from "@common/helpers";
import { Conversation, Post } from "@entities";

@Embeddable()
export class Social {
  @Property()
  twitter?: string;

  @Property()
  facebook?: string;

  @Property()
  linkedin?: string;
}

@Entity()
export class User extends BaseEntity {
  @Property()
  firstName!: string;

  @Property()
  middleName?: string;

  @Property()
  lastName!: string;

  @Property({ index: true, unique: true })
  username!: string;

  @Property({ index: true, unique: true })
  email!: string;

  @Property({ columnType: "text" })
  bio!: string;

  @Property({ columnType: "text" })
  avatar!: string;

  @Property({ hidden: true, columnType: "text", lazy: true })
  password!: string;

  @Property()
  twoFactorSecret?: string;

  @Property()
  isTwoFactorEnabled? = false;

  @Index()
  @Enum({ items: () => Roles, array: true })
  roles?: Roles[] = [Roles.AUTHOR];

  @Property({ index: true, unique: true })
  mobileNumber?: string;

  @Property()
  isVerified? = false;

  @OneToMany(() => Post, post => post.author, {
    orphanRemoval: true,
  })
  posts = new Collection<Post>(this);

  @ManyToMany(() => Conversation, "users", { owner: true })
  conversations = new Collection<Conversation>(this);

  @ManyToMany({ hidden: true })
  favorites = new Collection<Post>(this);

  @Embedded(() => Social, { object: true, nullable: true })
  social?: Social;

  @ManyToMany({
    entity: () => User,
    inversedBy: u => u.followed,
    owner: true,
    pivotTable: "user_to_follower",
    joinColumn: "follower",
    inverseJoinColumn: "following",
    hidden: true,
  })
  followers = new Collection<User>(this);

  @ManyToMany(() => User, u => u.followers)
  followed = new Collection<User>(this);

  @Property()
  lastLogin? = new Date();

  constructor(data?: Pick<User, "idx">) {
    super();
    Object.assign(this, data);
  }

  toJSON() {
    const o = wrap<User>(this).toObject();

    o.avatar
      = this.avatar
      || `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`;

    return o;
  }

  @BeforeCreate()
  @BeforeUpdate()
  @BeforeUpsert()
  async hashPassword(arguments_: EventArgs<this>) {
    if (arguments_.changeSet?.payload?.password)
      this.password = await HelperService.hashString(this.password);
  }
}

type A = FilterQuery<User>;

export const x: A = {
  username: "1",
  idx: "1",
};
