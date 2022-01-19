import { Migration } from '@mikro-orm/migrations';

export class Migration20220119144738 extends Migration {
	async up(): Promise<void> {
		this.addSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

		this.addSql(
			'create table "user" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "full_name" varchar(50) not null, "bio" varchar(250) null, "website" varchar(50) null, "avatar" varchar(50) null, "email" varchar(60) not null, "username" varchar(50) not null, "password" varchar(255) not null);',
		);
		this.addSql(
			'alter table "user" add constraint "user_email_unique" unique ("email");',
		);

		this.addSql(
			'create table "refresh_token" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "expires_in" timestamptz(0) not null, "user_id" int not null, "is_revoked" boolean not null default false);',
		);

		this.addSql(
			'create table "protocol" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "login_attemptnumbererval" int not null, "loginnumbererval_unit" varchar(255) not null, "login_max_retry" int not null, "otp_expiry_in_minutes" int not null, "mpin_attemptnumbererval" int not null, "mpinnumbererval_unit" varchar(255) null, "mpin_max_retry" int null);',
		);

		this.addSql(
			'create table "post" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "caption" varchar(250) null, "file" varchar(50) not null, "tag_list" text[] null, "user_id" int not null);',
		);

		this.addSql(
			'create table "otp_log" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "expires_in" timestamptz(0) not null, "otp_code" varchar(20) null, "user_id" int not null, "is_revoked" boolean not null default false);',
		);

		this.addSql(
			'create table "comment" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "text" varchar(250) not null, "post_id" int not null, "user_id" int not null);',
		);

		this.addSql(
			'create table "activity_log" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" boolean not null default true, "is_obsolete" boolean not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "activity_type" varchar(50) null, "login_type" varchar(50) null, "ip_address" varchar(50) null, "device_id" varchar(50) null, "status" boolean not null default true, "login_status" boolean not null default true, "user_id" int not null);',
		);

		this.addSql(
			'alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
		);

		this.addSql(
			'alter table "post" add constraint "post_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
		);

		this.addSql(
			'alter table "otp_log" add constraint "otp_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
		);

		this.addSql(
			'alter table "comment" add constraint "comment_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade;',
		);
		this.addSql(
			'alter table "comment" add constraint "comment_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
		);

		this.addSql(
			'alter table "activity_log" add constraint "activity_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table "refresh_token" drop constraint "refresh_token_user_id_foreign";',
		);

		this.addSql(
			'alter table "post" drop constraint "post_user_id_foreign";',
		);

		this.addSql(
			'alter table "otp_log" drop constraint "otp_log_user_id_foreign";',
		);

		this.addSql(
			'alter table "comment" drop constraint "comment_user_id_foreign";',
		);

		this.addSql(
			'alter table "activity_log" drop constraint "activity_log_user_id_foreign";',
		);

		this.addSql(
			'alter table "comment" drop constraint "comment_post_id_foreign";',
		);

		this.addSql('drop table if exists "user" cascade;');

		this.addSql('drop table if exists "refresh_token" cascade;');

		this.addSql('drop table if exists "protocol" cascade;');

		this.addSql('drop table if exists "post" cascade;');

		this.addSql('drop table if exists "otp_log" cascade;');

		this.addSql('drop table if exists "comment" cascade;');

		this.addSql('drop table if exists "activity_log" cascade;');
	}
}
