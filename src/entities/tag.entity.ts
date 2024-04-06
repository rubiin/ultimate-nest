import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Collection,
  Entity,
  EventArgs,
  ManyToMany,
  Property,
} from "@mikro-orm/postgresql";
import { slugify } from "helper-fns";
import { BaseEntity } from "@common/database";
import { Post } from "./post.entity";

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

  @ManyToMany(() => Post, post => post.tags)
  posts = new Collection<Post>(this);

  constructor(partial?: Partial<Tag>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeCreate()
  @BeforeUpsert()
  @BeforeUpdate()
  generateSlug(arguments_: EventArgs<this>) {
    if (arguments_.changeSet?.payload?.title)
      this.slug = slugify(this.title);
  }
}
