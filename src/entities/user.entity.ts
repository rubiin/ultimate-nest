import { Roles } from "@common/@types";
import { BaseEntity } from "@common/database";
import { HelperService } from "@common/helpers";
import { Conversation, Post } from "@entities";
import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Check,
  Embeddable,
  Embedded,
  Entity,
  Enum,
  ManyToMany,
  OneToMany,
  Property,
} from "@mikro-orm/decorators/legacy";
import type { EventArgs } from "@mikro-orm/postgresql";
import { Collection, type Opt } from "@mikro-orm/postgresql";
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

  @Property({ columnType: "text", hidden: true })
  avatar!: string;

  /**
   * Serialized as `avatar`: the stored avatar, or a generated ui-avatars URL when none is set.
   * The persisted column is hidden so the response carries a single `avatar` key.
   */
  @Property({ persist: false, serializedName: "avatar" })
  get avatarUrl(): string & Opt {
    return (
      this.avatar ??
      `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`
    );
  }

  @Property({ hidden: true, columnType: "text", lazy: true })
  password!: string;

  @Property({ hidden: true })
  twoFactorSecret?: string;

  @Property()
  isTwoFactorEnabled? = false;

  @Enum({ items: () => Roles, array: true, index: true })
  // Named explicitly: the default "user_roles_check" is already taken by the enum-array check.
  @Check({ name: "user_roles_not_empty_check", expression: "cardinality(roles) > 0" })
  roles?: Roles[] = [Roles.AUTHOR];

  @Property({ index: true, unique: true })
  mobileNumber?: string;

  @Property()
  isVerified? = false;

  @OneToMany(() => Post, (post) => post.author, {
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
    inversedBy: (u) => u.followed,
    owner: true,
    pivotTable: "user_to_follower",
    joinColumn: "follower",
    inverseJoinColumn: "following",
    hidden: true,
  })
  followers = new Collection<User>(this);

  @ManyToMany(() => User, (u) => u.followers)
  followed = new Collection<User>(this);

  @Property()
  lastLogin? = new Date();

  constructor(data?: Pick<User, "idx">) {
    super();
    Object.assign(this, data);
  }

  @BeforeCreate()
  @BeforeUpdate()
  @BeforeUpsert()
  async hashPassword(eventArguments: EventArgs<this>) {
    if (eventArguments?.changeSet?.payload?.password)
      this.password = await HelperService.hashString(this.password);
  }
}
