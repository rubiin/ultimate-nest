import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  SerializedPrimaryKey,
} from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Author } from "./Author.entity";

@ObjectType()
@Entity()
export class Book {
  @Field(() => ID)
  @PrimaryKey()
  id: number;

  @Field()
  @Property({ defaultRaw: "uuid_generate_v4()" })
  idx: string;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt: Date = new Date();

  @Field()
  @Property({
    defaultRaw: "CURRENT_TIMESTAMP",
    nullable: true,
    onUpdate: () => new Date(),
  })
  updatedAt?: Date = new Date();

  @Field(() => [Author])
  @ManyToOne(() => Author) // when you provide correct type hint, ORM will read it for you
  author: Author;

  constructor(title: string, author: Author) {
    this.title = title;
    this.author = author;
  }
}
