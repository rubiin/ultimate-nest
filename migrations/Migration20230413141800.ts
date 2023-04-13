import { Migration } from '@mikro-orm/migrations';

export class Migration20230413141800 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `news_letter` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `email` text not null);');

    this.addSql('PRAGMA foreign_keys = OFF;');
    this.addSql('CREATE TABLE `_knex_temp_alter981` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `idx` text NOT NULL, `is_active` integer NOT NULL DEFAULT true, `is_obsolete` integer NOT NULL DEFAULT false, `deleted_at` datetime NULL, `created_at` datetime NOT NULL, `updated_at` datetime NULL, `first_name` text NOT NULL, `middle_name` text NULL, `last_name` text NOT NULL, `username` text NOT NULL, `email` text NOT NULL, `bio` text NOT NULL, `avatar` text NOT NULL, `password` text NOT NULL, `two_factor_secret` text NULL, `is_two_factor_enabled` integer NOT NULL DEFAULT false, `roles` text NOT NULL, `mobile_number` text NULL, `is_verified` integer NOT NULL DEFAULT false, `last_login` datetime NOT NULL);');
    this.addSql('INSERT INTO "_knex_temp_alter981" SELECT * FROM "user";;');
    this.addSql('DROP TABLE "user";');
    this.addSql('ALTER TABLE "_knex_temp_alter981" RENAME TO "user";');
    this.addSql('CREATE UNIQUE INDEX `user_username_unique` on `user` (`username`);');
    this.addSql('CREATE UNIQUE INDEX `user_email_unique` on `user` (`email`);');
    this.addSql('CREATE UNIQUE INDEX `user_mobile_number_unique` on `user` (`mobile_number`);');
    this.addSql('PRAGMA foreign_keys = ON;');

    this.addSql('drop index `message_user_id_index`;');
    this.addSql('alter table `message` rename column `user_id` to `sender_id`;');
    this.addSql('create index `message_sender_id_index` on `message` (`sender_id`);');
  }

}
