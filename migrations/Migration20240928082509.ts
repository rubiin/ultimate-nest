import { Migration } from '@mikro-orm/migrations';

export class Migration20240928082509 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "category" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "name" varchar(255) not null, "description" varchar(255) not null);`);
    this.addSql(`create index "category_idx_index" on "category" ("idx");`);
    this.addSql(`create index "category_is_deleted_index" on "category" ("is_deleted");`);
    this.addSql(`create index "category_name_index" on "category" ("name");`);

    this.addSql(`create table "conversation" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "chat_name" varchar(255) not null);`);
    this.addSql(`create index "conversation_idx_index" on "conversation" ("idx");`);
    this.addSql(`create index "conversation_is_deleted_index" on "conversation" ("is_deleted");`);
    this.addSql(`create index "conversation_chat_name_index" on "conversation" ("chat_name");`);

    this.addSql(`create table "news_letter" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "name" varchar(255) not null, "content" text not null, "sent_at" timestamptz null);`);
    this.addSql(`create index "news_letter_idx_index" on "news_letter" ("idx");`);
    this.addSql(`create index "news_letter_is_deleted_index" on "news_letter" ("is_deleted");`);
    this.addSql(`create index "news_letter_name_index" on "news_letter" ("name");`);
    this.addSql(`alter table "news_letter" add constraint "news_letter_name_unique" unique ("name");`);

    this.addSql(`create table "protocol" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "login_attemptnumbererval" int not null, "loginnumbererval_unit" varchar(255) not null, "login_max_retry" int not null, "otp_expiry_in_minutes" int not null);`);
    this.addSql(`create index "protocol_idx_index" on "protocol" ("idx");`);
    this.addSql(`create index "protocol_is_deleted_index" on "protocol" ("is_deleted");`);

    this.addSql(`create table "subscriber" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "email" varchar(255) not null);`);
    this.addSql(`create index "subscriber_idx_index" on "subscriber" ("idx");`);
    this.addSql(`create index "subscriber_is_deleted_index" on "subscriber" ("is_deleted");`);
    this.addSql(`create index "subscriber_email_index" on "subscriber" ("email");`);
    this.addSql(`alter table "subscriber" add constraint "subscriber_email_unique" unique ("email");`);

    this.addSql(`create table "tag" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "title" varchar(50) not null, "description" text not null, "slug" varchar(255) null);`);
    this.addSql(`create index "tag_idx_index" on "tag" ("idx");`);
    this.addSql(`create index "tag_is_deleted_index" on "tag" ("is_deleted");`);
    this.addSql(`create index "tag_title_index" on "tag" ("title");`);
    this.addSql(`alter table "tag" add constraint "tag_title_unique" unique ("title");`);
    this.addSql(`create index "tag_slug_index" on "tag" ("slug");`);

    this.addSql(`create table "user" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "first_name" varchar(255) not null, "middle_name" varchar(255) null, "last_name" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "bio" text not null, "avatar" text not null, "password" text not null, "two_factor_secret" varchar(255) null, "is_two_factor_enabled" boolean null default false, "roles" text[] null, "mobile_number" varchar(255) null, "is_verified" boolean null default false, "social" jsonb null, "last_login" timestamptz null);`);
    this.addSql(`create index "user_idx_index" on "user" ("idx");`);
    this.addSql(`create index "user_is_deleted_index" on "user" ("is_deleted");`);
    this.addSql(`create index "user_username_index" on "user" ("username");`);
    this.addSql(`alter table "user" add constraint "user_username_unique" unique ("username");`);
    this.addSql(`create index "user_email_index" on "user" ("email");`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
    this.addSql(`create index "user_roles_index" on "user" ("roles");`);
    this.addSql(`create index "user_mobile_number_index" on "user" ("mobile_number");`);
    this.addSql(`alter table "user" add constraint "user_mobile_number_unique" unique ("mobile_number");`);

    this.addSql(`create table "refresh_token" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "expires_in" timestamptz not null, "user_id" int not null, "is_revoked" boolean not null default false);`);
    this.addSql(`create index "refresh_token_idx_index" on "refresh_token" ("idx");`);
    this.addSql(`create index "refresh_token_is_deleted_index" on "refresh_token" ("is_deleted");`);
    this.addSql(`create index "refresh_token_user_id_index" on "refresh_token" ("user_id");`);
    this.addSql(`create index "refresh_token_is_revoked_index" on "refresh_token" ("is_revoked");`);

    this.addSql(`create table "referral" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "referrer_id" int not null, "mobile_number" varchar(255) not null, "status" text check ("status" in ('PENDING', 'COMPLETED')) not null default 'PENDING');`);
    this.addSql(`create index "referral_idx_index" on "referral" ("idx");`);
    this.addSql(`create index "referral_is_deleted_index" on "referral" ("is_deleted");`);
    this.addSql(`create index "referral_referrer_id_index" on "referral" ("referrer_id");`);
    this.addSql(`create index "referral_mobile_number_index" on "referral" ("mobile_number");`);
    this.addSql(`create index "referral_status_index" on "referral" ("status");`);

    this.addSql(`create table "post" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "slug" varchar(255) null, "title" varchar(255) not null, "description" text not null, "content" text not null, "reading_time" int not null default 0, "read_count" int not null default 0, "published" boolean not null default false, "favorites_count" int not null default 0, "author_id" int not null, "state" text check ("state" in ('DRAFT', 'PUBLISHED')) not null default 'DRAFT');`);
    this.addSql(`create index "post_idx_index" on "post" ("idx");`);
    this.addSql(`create index "post_is_deleted_index" on "post" ("is_deleted");`);
    this.addSql(`create index "post_slug_index" on "post" ("slug");`);
    this.addSql(`create index "post_title_index" on "post" ("title");`);
    this.addSql(`create index "post_published_index" on "post" ("published");`);
    this.addSql(`create index "post_author_id_index" on "post" ("author_id");`);

    this.addSql(`create table "post_tags" ("post_id" int not null, "tag_id" int not null, constraint "post_tags_pkey" primary key ("post_id", "tag_id"));`);

    this.addSql(`create table "post_categories" ("post_id" int not null, "category_id" int not null, constraint "post_categories_pkey" primary key ("post_id", "category_id"));`);

    this.addSql(`create table "point_redemption_log" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "points" int not null, "amount" numeric(9,2) not null, "user_id" int not null);`);
    this.addSql(`create index "point_redemption_log_idx_index" on "point_redemption_log" ("idx");`);
    this.addSql(`create index "point_redemption_log_is_deleted_index" on "point_redemption_log" ("is_deleted");`);
    this.addSql(`create index "point_redemption_log_user_id_index" on "point_redemption_log" ("user_id");`);

    this.addSql(`create table "otp_log" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "expires_in" timestamptz not null, "otp_code" varchar(20) null, "user_id" int not null, "is_used" boolean not null default false);`);
    this.addSql(`create index "otp_log_idx_index" on "otp_log" ("idx");`);
    this.addSql(`create index "otp_log_is_deleted_index" on "otp_log" ("is_deleted");`);
    this.addSql(`create index "otp_log_otp_code_index" on "otp_log" ("otp_code");`);
    this.addSql(`create index "otp_log_user_id_index" on "otp_log" ("user_id");`);

    this.addSql(`create table "message" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "body" varchar(255) not null, "sender_id" int not null, "conversation_id" int not null, "is_read" boolean not null default false, "read_at" timestamptz null);`);
    this.addSql(`create index "message_idx_index" on "message" ("idx");`);
    this.addSql(`create index "message_is_deleted_index" on "message" ("is_deleted");`);
    this.addSql(`create index "message_sender_id_index" on "message" ("sender_id");`);
    this.addSql(`create index "message_conversation_id_index" on "message" ("conversation_id");`);

    this.addSql(`create table "comment" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "body" varchar(255) not null, "post_id" int not null, "author_id" int not null);`);
    this.addSql(`create index "comment_idx_index" on "comment" ("idx");`);
    this.addSql(`create index "comment_is_deleted_index" on "comment" ("is_deleted");`);
    this.addSql(`create index "comment_post_id_index" on "comment" ("post_id");`);
    this.addSql(`create index "comment_author_id_index" on "comment" ("author_id");`);

    this.addSql(`create table "user_conversations" ("user_id" int not null, "conversation_id" int not null, constraint "user_conversations_pkey" primary key ("user_id", "conversation_id"));`);

    this.addSql(`create table "user_favorites" ("user_id" int not null, "post_id" int not null, constraint "user_favorites_pkey" primary key ("user_id", "post_id"));`);

    this.addSql(`create table "user_to_follower" ("follower" int not null, "following" int not null, constraint "user_to_follower_pkey" primary key ("follower", "following"));`);

    this.addSql(`alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "referral" add constraint "referral_referrer_id_foreign" foreign key ("referrer_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "post_tags" add constraint "post_tags_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "post_tags" add constraint "post_tags_tag_id_foreign" foreign key ("tag_id") references "tag" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "post_categories" add constraint "post_categories_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "post_categories" add constraint "post_categories_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "point_redemption_log" add constraint "point_redemption_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "otp_log" add constraint "otp_log_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "message" add constraint "message_sender_id_foreign" foreign key ("sender_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "message" add constraint "message_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade;`);

    this.addSql(`alter table "comment" add constraint "comment_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade;`);
    this.addSql(`alter table "comment" add constraint "comment_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "user_conversations" add constraint "user_conversations_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_conversations" add constraint "user_conversations_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_favorites" add constraint "user_favorites_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_favorites" add constraint "user_favorites_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_to_follower" add constraint "user_to_follower_follower_foreign" foreign key ("follower") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_to_follower" add constraint "user_to_follower_following_foreign" foreign key ("following") references "user" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "post_categories" drop constraint "post_categories_category_id_foreign";`);

    this.addSql(`alter table "message" drop constraint "message_conversation_id_foreign";`);

    this.addSql(`alter table "user_conversations" drop constraint "user_conversations_conversation_id_foreign";`);

    this.addSql(`alter table "post_tags" drop constraint "post_tags_tag_id_foreign";`);

    this.addSql(`alter table "refresh_token" drop constraint "refresh_token_user_id_foreign";`);

    this.addSql(`alter table "referral" drop constraint "referral_referrer_id_foreign";`);

    this.addSql(`alter table "post" drop constraint "post_author_id_foreign";`);

    this.addSql(`alter table "point_redemption_log" drop constraint "point_redemption_log_user_id_foreign";`);

    this.addSql(`alter table "otp_log" drop constraint "otp_log_user_id_foreign";`);

    this.addSql(`alter table "message" drop constraint "message_sender_id_foreign";`);

    this.addSql(`alter table "comment" drop constraint "comment_author_id_foreign";`);

    this.addSql(`alter table "user_conversations" drop constraint "user_conversations_user_id_foreign";`);

    this.addSql(`alter table "user_favorites" drop constraint "user_favorites_user_id_foreign";`);

    this.addSql(`alter table "user_to_follower" drop constraint "user_to_follower_follower_foreign";`);

    this.addSql(`alter table "user_to_follower" drop constraint "user_to_follower_following_foreign";`);

    this.addSql(`alter table "post_tags" drop constraint "post_tags_post_id_foreign";`);

    this.addSql(`alter table "post_categories" drop constraint "post_categories_post_id_foreign";`);

    this.addSql(`alter table "comment" drop constraint "comment_post_id_foreign";`);

    this.addSql(`alter table "user_favorites" drop constraint "user_favorites_post_id_foreign";`);

    this.addSql(`drop table if exists "category" cascade;`);

    this.addSql(`drop table if exists "conversation" cascade;`);

    this.addSql(`drop table if exists "news_letter" cascade;`);

    this.addSql(`drop table if exists "protocol" cascade;`);

    this.addSql(`drop table if exists "subscriber" cascade;`);

    this.addSql(`drop table if exists "tag" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "refresh_token" cascade;`);

    this.addSql(`drop table if exists "referral" cascade;`);

    this.addSql(`drop table if exists "post" cascade;`);

    this.addSql(`drop table if exists "post_tags" cascade;`);

    this.addSql(`drop table if exists "post_categories" cascade;`);

    this.addSql(`drop table if exists "point_redemption_log" cascade;`);

    this.addSql(`drop table if exists "otp_log" cascade;`);

    this.addSql(`drop table if exists "message" cascade;`);

    this.addSql(`drop table if exists "comment" cascade;`);

    this.addSql(`drop table if exists "user_conversations" cascade;`);

    this.addSql(`drop table if exists "user_favorites" cascade;`);

    this.addSql(`drop table if exists "user_to_follower" cascade;`);
  }

}
