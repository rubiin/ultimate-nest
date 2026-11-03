import { BaseEntity } from "@common/database/index.js";
import { Entity, Property, ManyToMany } from "@mikro-orm/decorators/legacy";
import { Collection } from "@mikro-orm/postgresql";

import { Post } from "./index.js";

@Entity()
export class Category extends BaseEntity {
  @Property({ index: true })
  name!: string;

  @Property({ columnType: "text" })
  description!: string;

  @ManyToMany(() => Post, (post) => post.categories)
  posts = new Collection<Post>(this);

  constructor(partial?: Partial<Category>) {
    super();
    Object.assign(this, partial);
  }
}
