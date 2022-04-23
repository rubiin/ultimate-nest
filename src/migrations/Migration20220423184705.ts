import { Migration } from "@mikro-orm/migrations";

export class Migration20220423184705 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table "post" drop column "category";');
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table "post" add column "category" varchar(255) not null;',
		);
	}
}
