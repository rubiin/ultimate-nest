import { Migration } from '@mikro-orm/migrations';

export class Migration20210118155941 extends Migration {
	async up(): Promise<void> {
		this.addSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
		this.addSql(
			`create table "user" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "first_name" varchar(50) not null, "middle_name" varchar(50) null, "last_name" varchar(50) not null, "username" varchar(50) not null);`,
		);
		this.addSql(
			`alter table "user" add constraint "user_username_unique" unique ("username");`,
		);

		this.addSql(
			`create table "refresh_token" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "expires_in" timestamptz(0) not null, "user_id" int4 not null, "is_revoked" bool not null default false);`,
		);

		this.addSql(
			`create table "otp_log" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "expires_in" timestamptz(0) not null, "otp_code" varchar(20) null, "user_id" int4 not null, "is_revoked" bool not null default false);`,
		);

		this.addSql(
			`create table "activity_log" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "activity_type" varchar(50) null, "login_type" varchar(50) null, "ip_address" varchar(50) null, "device_id" varchar(50) null, "status" bool not null default true, "login_status" bool not null default true, "user_id" int4 not null);`,
		);

		this.addSql(
			`alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
		);

		this.addSql(
			`alter table "otp_log" add constraint "otp_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
		);

		this.addSql(
			`alter table "activity_log" add constraint "activity_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
		);
	}
}
