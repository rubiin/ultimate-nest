import { Entity, Property } from "@mikro-orm/postgresql";
import { BaseEntity } from "@common/database";

@Entity()
export class NewsLetter extends BaseEntity {
  @Property({ index: true, unique: true })
  name!: string;

  @Property({ columnType: "text" })
  content!: string;

  @Property()
  sentAt?: Date;

  constructor(partial?: Partial<NewsLetter>) {
    super();
    Object.assign(this, partial);
  }
}
