import { Migration } from '@mikro-orm/migrations';

export class Migration20261016150837 extends Migration {

  override name = 'Migration20261016150837';

  override up(): void | Promise<void> {
    this.addSql(`alter table "post" drop constraint "post_state_check";`);
    this.addSql(`alter table "post" add "publish_at" timestamptz null;`);
    this.addSql(`create index "post_publish_at_index" on "post" ("publish_at");`);
    this.addSql(`alter table "post" add constraint "post_state_check" check ("state" in ('DRAFT', 'SCHEDULED', 'PUBLISHED'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "post_publish_at_index";`);
    this.addSql(`alter table "post" drop constraint "post_state_check";`);
    this.addSql(`alter table "post" drop column "publish_at";`);
    this.addSql(`alter table "post" add constraint "post_state_check" check ("state" in ('DRAFT', 'PUBLISHED'));`);
  }

}
