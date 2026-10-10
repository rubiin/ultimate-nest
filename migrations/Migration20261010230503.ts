import { Migration } from "@mikro-orm/migrations";

export class Migration20261010230503 extends Migration {
  override name = "Migration20261010230503";

  override up(): void | Promise<void> {
    this.addSql(
      `create table "news_letter_log" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "news_letter_id" int not null, "subscriber_id" int not null, "status" text not null, "error" text null, "attempted_at" timestamptz not null);`,
    );
    this.addSql(`create index "news_letter_log_idx_index" on "news_letter_log" ("idx");`);
    this.addSql(
      `create index "news_letter_log_is_deleted_index" on "news_letter_log" ("is_deleted");`,
    );
    this.addSql(
      `create index "news_letter_log_news_letter_id_index" on "news_letter_log" ("news_letter_id");`,
    );
    this.addSql(
      `create index "news_letter_log_subscriber_id_index" on "news_letter_log" ("subscriber_id");`,
    );
    this.addSql(`create index "news_letter_log_status_index" on "news_letter_log" ("status");`);
    this.addSql(
      `alter table "news_letter_log" add constraint "news_letter_log_news_letter_id_subscriber_id_unique" unique ("news_letter_id", "subscriber_id");`,
    );

    this.addSql(
      `alter table "news_letter_log" add constraint "news_letter_log_news_letter_id_foreign" foreign key ("news_letter_id") references "news_letter" ("id");`,
    );
    this.addSql(
      `alter table "news_letter_log" add constraint "news_letter_log_subscriber_id_foreign" foreign key ("subscriber_id") references "subscriber" ("id");`,
    );
    this.addSql(
      `alter table "news_letter_log" add constraint "news_letter_log_status_check" check ("status" in ('SENT', 'FAILED'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "news_letter_log" cascade;`);
  }
}
