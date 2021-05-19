import { Migration } from '@mikro-orm/migrations';

export class Migration20210519103241 extends Migration {

  async up(): Promise<void> {
    this.addSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    this.addSql('create table "user" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "first_name" varchar(50) not null, "middle_name" varchar(50) null, "last_name" varchar(50) not null, "email" varchar(60) not null, "password" varchar(255) not null, "street" varchar(255) not null, "apartment" varchar(255) not null, "city" varchar(255) not null, "zip" varchar(255) not null, "country" varchar(255) not null, "phone" varchar(50) not null, "is_admin" bool not null, "roles" text[] not null);');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "refresh_token" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "expires_in" timestamptz(0) not null, "user_id" int4 not null, "is_revoked" bool not null default false);');

    this.addSql('create table "protocol" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "login_attemptnumbererval" int4 not null, "loginnumbererval_unit" varchar(255) not null, "login_max_retry" int4 not null, "otp_expiry_in_minutes" int4 not null, "mpin_attemptnumbererval" int4 not null, "mpinnumbererval_unit" varchar(255) null, "mpin_max_retry" int4 null);');

    this.addSql('create table "post" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "slug" varchar(255) not null, "title" varchar(150) not null, "excerpt" varchar(250) not null, "content" varchar(255) not null, "category" varchar(100) null, "tags" text[] not null, "author_id" int4 not null);');

    this.addSql('create table "otp_log" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "expires_in" timestamptz(0) not null, "otp_code" varchar(20) null, "user_id" int4 not null, "is_revoked" bool not null default false);');

    this.addSql('create table "activity_log" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "activity_type" varchar(50) null, "login_type" varchar(50) null, "ip_address" varchar(50) null, "device_id" varchar(50) null, "status" bool not null default true, "login_status" bool not null default true, "user_id" int4 not null);');

    this.addSql('alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "otp_log" add constraint "otp_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "activity_log" add constraint "activity_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
  }

}
