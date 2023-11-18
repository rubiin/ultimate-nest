import type { EventArgs, Ref, Rel } from "@mikro-orm/core";
import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Collection,
  Entity,
  Enum,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
} from "@mikro-orm/core";
import { slugify } from "helper-fns";
import { BaseEntity } from "@common/database";
import { PostStateEnum } from "@common/@types";
import type { User } from "./index";
import { Category, Comment, Tag } from "./index";

@Entity()
export class Post extends BaseEntity {
  @Property({ index: true })
  slug?: string;

  @Property({ index: true })
  title!: string;

  @Property({ type: "text" })
  description!: string;

  @Property({ type: "text" })
  content!: string;

  @Property()
  readingTime? = 0;

  @Property()
  readCount? = 0;

  @Property()
  favoritesCount? = 0;

  @ManyToOne({
    eager: false,
    index: true,
  })
  author!: Rel<Ref<User>>;

  @OneToMany(() => Comment, comment => comment.post, {
    eager: false,
    orphanRemoval: true,
    nullable: true,
  })
  comments = new Collection<Comment>(this);

  @ManyToMany(() => Tag, "posts", { owner: true })
  tags = new Collection<Tag>(this);

  @ManyToMany(() => Category, "posts", { owner: true })
  categories = new Collection<Category>(this);

  @Enum({ items: () => PostStateEnum })
  state? = PostStateEnum.DRAFT;

  constructor(partial?: Partial<Post>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeUpsert()
  @BeforeCreate()
  @BeforeUpdate()
  async generateSlug(arguments_: EventArgs<this>) {
    if (arguments_.changeSet?.payload?.title) {
      this.slug
        = `${slugify(this.title)
        }-${Math.trunc(Math.random() * 36 ** 6).toString(36)}`;
    }
    this.readingTime = this.getReadingTime(this.content);
  }

  getReadingTime(content: string) {
    const avgWordsPerMin = 250;
    const count = content.match(/\w+/g)?.length ?? 0;

    return Math.ceil(count / avgWordsPerMin);
  }
}
