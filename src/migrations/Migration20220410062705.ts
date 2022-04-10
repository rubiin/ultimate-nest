import { Migration } from "@mikro-orm/migrations";

export class Migration20220410062705 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table "user" add column "mobile_number" varchar(255) null;',
		);
		this.addSql(
			'alter table "user" drop constraint if exists "user_roles_check";',
		);
		this.addSql(
			'alter table "user" alter column "roles" type text[] using ("roles"::text[]);',
		);
		this.addSql('alter table "user" drop column "status";');
		this.addSql(
			'alter table "user" add constraint "user_email_unique" unique ("email");',
		);
		this.addSql(
			'alter table "user" add constraint "user_mobile_number_unique" unique ("mobile_number");',
		);

		this.addSql(
			'alter table "post" drop constraint if exists "post_content_check";',
		);
		this.addSql(
			'alter table "post" alter column "content" type varchar(255) using ("content"::varchar(255));',
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table "user" add column "status" boolean not null;');
		this.addSql(
			'alter table "user" drop constraint if exists "user_roles_check";',
		);
		this.addSql(
			'alter table "user" alter column "roles" type text[] using ("roles"::text[]);',
		);
		this.addSql('alter table "user" drop constraint "user_email_unique";');
		this.addSql(
			'alter table "user" drop constraint "user_mobile_number_unique";',
		);
		this.addSql('alter table "user" drop column "mobile_number";');

		this.addSql(
			'alter table "post" drop constraint if exists "post_content_check";',
		);
		this.addSql(
			'alter table "post" alter column "content" type text using ("content"::text);',
		);
	}
}
