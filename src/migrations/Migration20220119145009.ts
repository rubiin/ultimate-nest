import { Migration } from '@mikro-orm/migrations';

export class Migration20220119145009 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table "post" drop column "tag_list";');
	}

	async down(): Promise<void> {
		this.addSql('alter table "post" add column "tag_list" text[] null;');
	}
}
