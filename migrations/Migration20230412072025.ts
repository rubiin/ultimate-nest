import { Migration } from '@mikro-orm/migrations';

export class Migration20230412072025 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `category` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `name` text not null, `description` text not null);');

    this.addSql('create table `conversation` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `name` text not null);');

    this.addSql('create table `message` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `body` text not null, `conversation_id` integer not null, `is_read` integer not null default false, `read_at` datetime null, constraint `message_conversation_id_foreign` foreign key(`conversation_id`) references `conversation`(`id`) on update cascade);');
    this.addSql('create index `message_conversation_id_index` on `message` (`conversation_id`);');

    this.addSql('create table `protocol` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `login_attemptnumbererval` integer not null, `loginnumbererval_unit` text not null, `login_max_retry` integer not null, `otp_expiry_in_minutes` integer not null, `mpin_attempt_interval` integer not null, `mpin_interval_unit` text not null, `mpin_max_retry` integer not null);');

    this.addSql('create table `tag` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `title` text not null, `description` text not null, `slug` text null);');

    this.addSql('create table `user` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `first_name` text not null, `middle_name` text null, `last_name` text not null, `username` text not null, `email` text not null, `bio` text not null, `avatar` text not null, `password` text not null, `two_factor_secret` text null, `is_two_factor_enabled` integer not null default false, `roles` text not null default \'AUTHOR\', `mobile_number` text null, `is_verified` integer not null default false, `last_login` datetime not null);');
    this.addSql('create unique index `user_username_unique` on `user` (`username`);');
    this.addSql('create unique index `user_email_unique` on `user` (`email`);');
    this.addSql('create unique index `user_mobile_number_unique` on `user` (`mobile_number`);');

    this.addSql('create table `socket_connection` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `socket_id` text not null, `connected_user_id` integer not null, constraint `socket_connection_connected_user_id_foreign` foreign key(`connected_user_id`) references `user`(`id`) on update cascade);');
    this.addSql('create index `socket_connection_connected_user_id_index` on `socket_connection` (`connected_user_id`);');

    this.addSql('create table `refresh_token` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `expires_in` datetime not null, `user_id` integer not null, `is_revoked` integer not null default false, constraint `refresh_token_user_id_foreign` foreign key(`user_id`) references `user`(`id`) on update cascade);');
    this.addSql('create index `refresh_token_user_id_index` on `refresh_token` (`user_id`);');

    this.addSql('create table `post` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `slug` text null, `title` text not null, `description` text not null, `content` text not null, `state` text check (`state` in (\'DRAFT\', \'PUBLISHED\')) not null default \'DRAFT\', `reading_time` integer not null default 0, `read_count` integer not null default 0, `favorites_count` integer not null default 0, `author_id` integer not null, constraint `post_author_id_foreign` foreign key(`author_id`) references `user`(`id`) on update cascade);');
    this.addSql('create index `post_author_id_index` on `post` (`author_id`);');

    this.addSql('create table `post_tags` (`post_id` integer not null, `tag_id` integer not null, constraint `post_tags_post_id_foreign` foreign key(`post_id`) references `post`(`id`) on delete cascade on update cascade, constraint `post_tags_tag_id_foreign` foreign key(`tag_id`) references `tag`(`id`) on delete cascade on update cascade, primary key (`post_id`, `tag_id`));');
    this.addSql('create index `post_tags_post_id_index` on `post_tags` (`post_id`);');
    this.addSql('create index `post_tags_tag_id_index` on `post_tags` (`tag_id`);');

    this.addSql('create table `post_categories` (`post_id` integer not null, `category_id` integer not null, constraint `post_categories_post_id_foreign` foreign key(`post_id`) references `post`(`id`) on delete cascade on update cascade, constraint `post_categories_category_id_foreign` foreign key(`category_id`) references `category`(`id`) on delete cascade on update cascade, primary key (`post_id`, `category_id`));');
    this.addSql('create index `post_categories_post_id_index` on `post_categories` (`post_id`);');
    this.addSql('create index `post_categories_category_id_index` on `post_categories` (`category_id`);');

    this.addSql('create table `otp_log` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `expires_in` datetime not null, `otp_code` text null, `user_id` integer not null, `is_used` integer not null, constraint `otp_log_user_id_foreign` foreign key(`user_id`) references `user`(`id`) on update cascade);');
    this.addSql('create index `otp_log_user_id_index` on `otp_log` (`user_id`);');

    this.addSql('create table `comment` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `body` text not null, `post_id` integer not null, `author_id` integer not null, constraint `comment_post_id_foreign` foreign key(`post_id`) references `post`(`id`) on update cascade, constraint `comment_author_id_foreign` foreign key(`author_id`) references `user`(`id`) on update cascade);');
    this.addSql('create index `comment_post_id_index` on `comment` (`post_id`);');
    this.addSql('create index `comment_author_id_index` on `comment` (`author_id`);');

    this.addSql('create table `activity_log` (`id` integer not null primary key autoincrement, `idx` text not null, `is_active` integer not null default true, `is_obsolete` integer not null default false, `deleted_at` datetime null, `created_at` datetime not null, `updated_at` datetime null, `activity_type` text null, `login_type` text null, `ip_address` text null, `device_id` text null, `status` integer not null default true, `login_status` integer not null default true, `user_id` integer not null, constraint `activity_log_user_id_foreign` foreign key(`user_id`) references `user`(`id`) on update cascade);');
    this.addSql('create index `activity_log_user_id_index` on `activity_log` (`user_id`);');

    this.addSql('create table `user_conversations` (`user_id` integer not null, `conversation_id` integer not null, constraint `user_conversations_user_id_foreign` foreign key(`user_id`) references `user`(`id`) on delete cascade on update cascade, constraint `user_conversations_conversation_id_foreign` foreign key(`conversation_id`) references `conversation`(`id`) on delete cascade on update cascade, primary key (`user_id`, `conversation_id`));');
    this.addSql('create index `user_conversations_user_id_index` on `user_conversations` (`user_id`);');
    this.addSql('create index `user_conversations_conversation_id_index` on `user_conversations` (`conversation_id`);');

    this.addSql('create table `user_favorites` (`user_id` integer not null, `post_id` integer not null, constraint `user_favorites_user_id_foreign` foreign key(`user_id`) references `user`(`id`) on delete cascade on update cascade, constraint `user_favorites_post_id_foreign` foreign key(`post_id`) references `post`(`id`) on delete cascade on update cascade, primary key (`user_id`, `post_id`));');
    this.addSql('create index `user_favorites_user_id_index` on `user_favorites` (`user_id`);');
    this.addSql('create index `user_favorites_post_id_index` on `user_favorites` (`post_id`);');

    this.addSql('create table `user_to_follower` (`follower` integer not null, `following` integer not null, constraint `user_to_follower_follower_foreign` foreign key(`follower`) references `user`(`id`) on delete cascade on update cascade, constraint `user_to_follower_following_foreign` foreign key(`following`) references `user`(`id`) on delete cascade on update cascade, primary key (`follower`, `following`));');
    this.addSql('create index `user_to_follower_follower_index` on `user_to_follower` (`follower`);');
    this.addSql('create index `user_to_follower_following_index` on `user_to_follower` (`following`);');
  }

}
