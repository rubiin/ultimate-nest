import { NewsLetterLogStatus } from "@common/@types";
import { BaseEntity } from "@common/database";
import { Entity, Enum, ManyToOne, Property, Unique } from "@mikro-orm/decorators/legacy";
import type { Rel } from "@mikro-orm/postgresql";
import { Ref } from "@mikro-orm/postgresql";

import { NewsLetter } from "./news-letter.entity";
import { Subscriber } from "./subscribers.entity";

/** One row per newsletter and subscriber: the outcome of the last delivery attempt. */
@Entity()
@Unique({ properties: ["newsLetter", "subscriber"] })
export class NewsLetterLog extends BaseEntity {
  @ManyToOne({ index: true })
  newsLetter!: Rel<Ref<NewsLetter>>;

  @ManyToOne({ index: true })
  subscriber!: Rel<Ref<Subscriber>>;

  @Enum({ index: true, items: () => NewsLetterLogStatus })
  status!: NewsLetterLogStatus;

  @Property({ columnType: "text", nullable: true })
  error?: string;

  @Property()
  attemptedAt: Date = new Date();

  constructor(partial?: Partial<NewsLetterLog>) {
    super();
    Object.assign(this, partial);
  }
}
