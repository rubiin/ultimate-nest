import { Migration } from "@mikro-orm/migrations";

export class Migration20220407112454 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table "user" ("id" serial primary key, "idx" varchar(255) not null, "is_active" boolean not null, "is_obsolete" boolean not null, "deleted_at" timestamptz(0) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "avatar" varchar(255) not null, "password" varchar(255) not null, "roles" text[] not null, "status" boolean not null);',
		);

		this.addSql(
			'create table "refresh_token" ("id" serial primary key, "idx" varchar(255) not null, "is_active" boolean not null, "is_obsolete" boolean not null, "deleted_at" timestamptz(0) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "expires_in" timestamptz(0) not null, "user_id" int not null, "is_revoked" boolean not null);',
		);

		this.addSql(
			'create table "protocol" ("id" serial primary key, "idx" varchar(255) not null, "is_active" boolean not null, "is_obsolete" boolean not null, "deleted_at" timestamptz(0) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "login_attemptnumbererval" int not null, "loginnumbererval_unit" varchar(255) not null, "login_max_retry" int not null, "otp_expiry_in_minutes" int not null, "mpin_attempt_interval" int not null, "mpin_interval_unit" varchar(255) not null, "mpin_max_retry" int not null);',
		);

		this.addSql(
			'create table "post" ("id" serial primary key, "idx" varchar(255) not null, "is_active" boolean not null, "is_obsolete" boolean not null, "deleted_at" timestamptz(0) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "slug" varchar(255) not null, "title" varchar(255) not null, "excerpt" varchar(255) null, "content" varchar(255) not null, "category" varchar(255) not null, "tags" varchar(255) not null, "status" boolean not null, "author_id" int not null);',
		);

		this.addSql(
			'create table "otp_log" ("id" serial primary key, "idx" varchar(255) not null, "is_active" boolean not null, "is_obsolete" boolean not null, "deleted_at" timestamptz(0) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "expires_in" timestamptz(0) not null, "otp_code" varchar(20) null, "user_id" int not null, "is_revoked" boolean not null);',
		);

		this.addSql(
			'create table "activity_log" ("id" serial primary key, "idx" varchar(255) not null, "is_active" boolean not null, "is_obsolete" boolean not null, "deleted_at" timestamptz(0) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "activity_type" varchar(50) null, "login_type" varchar(50) null, "ip_address" varchar(50) null, "device_id" varchar(50) null, "status" boolean not null, "login_status" boolean not null, "user_id" int not null);',
		);

		this.addSql(
			'alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
		);

		this.addSql(
			'alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;',
		);

		this.addSql(
			'alter table "otp_log" add constraint "otp_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
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
			'alter table "post" drop constraint "post_author_id_foreign";',
		);

		this.addSql(
			'alter table "otp_log" drop constraint "otp_log_user_id_foreign";',
		);

		this.addSql(
			'alter table "activity_log" drop constraint "activity_log_user_id_foreign";',
		);

		this.addSql('drop table if exists "user" cascade;');

		this.addSql('drop table if exists "refresh_token" cascade;');

		this.addSql('drop table if exists "protocol" cascade;');

		this.addSql('drop table if exists "post" cascade;');

		this.addSql('drop table if exists "otp_log" cascade;');

		this.addSql('drop table if exists "activity_log" cascade;');
	}
}
