import { BaseEntity } from "@common/database";
import { Collection } from "@mikro-orm/postgresql";
import { Post } from "./index";
import { Entity, Property, ManyToMany } from "@mikro-orm/decorators/legacy";

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
