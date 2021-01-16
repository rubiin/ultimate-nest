import {
  Entity,
  OneToMany,
  Collection,
  Property,
  PrimaryKey,
  Unique,
  SerializedPrimaryKey,
} from "@mikro-orm/core";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Book } from "./Book.entity";

@ObjectType()
@Entity()
export class Author {
  @Field(() => ID)
  @PrimaryKey()
  id: number;

  @Field()
  @Property({ defaultRaw: "uuid_generate_v4()" })
  idx: string;

  @Field()
  @Property()
  name: string;

  @Field(() => Int)
  @Property()
  age: number;

  @Field()
  @Unique()
  @Property()
  username: string;

  @Field()
  @Property({ nullable: true, default: "Some dope author" })
  bio?: string;

  @Field(() => [Book])
  @OneToMany(() => Book, (book) => book.author)
  books = new Collection<Book>(this);

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
}
