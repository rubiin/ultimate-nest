import { Ref, Rel } from "@mikro-orm/postgresql";
import { Post, User } from "./index";
import { BaseEntity } from "@common/database";
import { Entity, Property, ManyToOne } from "@mikro-orm/decorators/legacy";

@Entity()
export class Comment extends BaseEntity {
  @Property()
  body!: string;

  @ManyToOne({
    index: true,
  })
  post!: Rel<Ref<Post>>;

  @ManyToOne({
    index: true,
  })
  author!: Rel<Ref<User>>;

  constructor(partial?: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
