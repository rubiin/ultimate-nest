import { Migration } from '@mikro-orm/migrations';

export class Migration20201012115652 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "author" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "name" varchar(255) not null, "age" int4 not null, "username" varchar(255) not null, "bio" varchar(255) null default \'Some dope author\', "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP);');
    this.addSql('alter table "author" add constraint "author_username_unique" unique ("username");');

    this.addSql('create table "book" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "title" varchar(255) not null, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "author_id" int4 not null);');

    this.addSql('alter table "book" add constraint "book_author_id_foreign" foreign key ("author_id") references "author" ("id") on update cascade;');
  }

}
