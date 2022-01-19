import { Migration } from '@mikro-orm/migrations';

export class Migration20220119145115 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table "post" drop constraint if exists "post_file_check";',
		);
		this.addSql(
			'alter table "post" alter column "file" type varchar(150) using ("file"::varchar(150));',
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table "post" drop constraint if exists "post_file_check";',
		);
		this.addSql(
			'alter table "post" alter column "file" type varchar(50) using ("file"::varchar(50));',
		);
	}
}
