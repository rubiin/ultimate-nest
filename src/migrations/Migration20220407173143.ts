import { Migration } from "@mikro-orm/migrations";

export class Migration20220407173143 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table "post" drop constraint if exists "post_content_check";',
		);
		this.addSql(
			'alter table "post" alter column "content" type text using ("content"::text);',
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table "post" drop constraint if exists "post_content_check";',
		);
		this.addSql(
			'alter table "post" alter column "content" type varchar(255) using ("content"::varchar(255));',
		);
	}
}
