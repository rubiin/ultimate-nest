import { Collection, EventArgs } from "@mikro-orm/postgresql";
import { BaseEntity } from "@common/database";
import { slugify } from "helper-fns";
import { Post } from "./post.entity";
import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Entity,
  ManyToMany,
  Property,
} from "@mikro-orm/decorators/legacy";
@Entity()
export class Tag extends BaseEntity {
  @Property({
    length: 50,
    index: true,
    unique: true,
  })
  title!: string;

  @Property({ columnType: "text" })
  description!: string;

  @Property({ index: true })
  slug?: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts = new Collection<Post>(this);

  constructor(partial?: Partial<Tag>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeCreate()
  @BeforeUpsert()
  @BeforeUpdate()
  generateSlug(eventArguments: EventArgs<this>) {
    if (eventArguments?.changeSet?.payload?.title) this.slug = slugify(this.title);
  }
}
