import { Migration } from '@mikro-orm/migrations';

export class Migration20210119042404 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table "protocol" ("id" serial primary key, "idx" varchar(255) not null default uuid_generate_v4(), "is_active" bool not null default true, "is_obsolete" bool not null default false, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) null default CURRENT_TIMESTAMP, "login_attemptnumbererval" int4 not null, "loginnumbererval_unit" varchar(255) not null, "login_max_retry" int4 not null, "otp_expiry_in_minutes" int4 not null, "mpin_attemptnumbererval" int4 not null, "mpinnumbererval_unit" varchar(255) null, "mpin_max_retry" int4 null);',
		);
	}
}
