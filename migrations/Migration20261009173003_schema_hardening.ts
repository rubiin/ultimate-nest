import { Migration } from "@mikro-orm/migrations";

export class Migration20261009173003_schema_hardening extends Migration {
  override name = "Migration20261009173003_schema_hardening";

  override up(): void | Promise<void> {
    this.addSql(
      `create table "audit_log" ("id" serial primary key, "action" text not null, "entity_name" varchar(255) not null, "entity_id" varchar(255) not null, "changes" jsonb null, "actor_id" int null, "ip" varchar(255) null, "request_id" varchar(255) null, "created_at" timestamptz not null);`,
    );
    this.addSql(
      `create index "audit_log_entity_name_entity_id_index" on "audit_log" ("entity_name", "entity_id");`,
    );
    this.addSql(
      `alter table "audit_log" add constraint "audit_log_action_check" check ("action" in ('create', 'update', 'delete'));`,
    );

    this.addSql(`drop table if exists "point_redemption_log" cascade;`);

    this.addSql(
      `alter table "protocol" drop column "login_attemptnumbererval", drop column "login_max_retry", drop column "loginnumbererval_unit";`,
    );

    this.addSql(
      `alter table "user" add constraint "user_roles_not_empty_check" check (cardinality(roles) > 0);`,
    );

    this.addSql(`alter table "post" add "version" int not null default 1;`);
    this.addSql(
      `alter table "post" add constraint "post_reading_time_check" check (reading_time >= 0);`,
    );
    this.addSql(
      `alter table "post" add constraint "post_favorites_count_check" check (favorites_count >= 0);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "post" drop constraint "post_favorites_count_check";`);
    this.addSql(`alter table "post" drop constraint "post_reading_time_check";`);
    this.addSql(`alter table "post" drop column "version";`);

    this.addSql(`alter table "user" drop constraint "user_roles_not_empty_check";`);

    // The dropped values are gone; temporary defaults only let NOT NULL succeed on existing rows.
    this.addSql(
      `alter table "protocol" add "login_attemptnumbererval" int not null default 0, add "loginnumbererval_unit" varchar(255) not null default '', add "login_max_retry" int not null default 0;`,
    );
    this.addSql(
      `alter table "protocol" alter column "login_attemptnumbererval" drop default, alter column "loginnumbererval_unit" drop default, alter column "login_max_retry" drop default;`,
    );

    this.addSql(
      `create table "point_redemption_log" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "points" int not null, "amount" numeric(9,2) not null, "user_id" int not null);`,
    );
    this.addSql(`create index "point_redemption_log_idx_index" on "point_redemption_log" ("idx");`);
    this.addSql(
      `create index "point_redemption_log_is_deleted_index" on "point_redemption_log" ("is_deleted");`,
    );
    this.addSql(
      `create index "point_redemption_log_user_id_index" on "point_redemption_log" ("user_id");`,
    );
    this.addSql(
      `alter table "point_redemption_log" add constraint "point_redemption_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );

    this.addSql(`drop table if exists "audit_log" cascade;`);
  }
}
