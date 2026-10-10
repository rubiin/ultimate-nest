import { Migration } from "@mikro-orm/migrations";

export class Migration20261010225551 extends Migration {
  override name = "Migration20261010225551";

  override up(): void | Promise<void> {
    this.addSql(
      `create table "audit_log" ("id" serial primary key, "action" text not null, "entity_name" varchar(255) not null, "entity_id" varchar(255) not null, "changes" jsonb null, "actor_id" int null, "ip" varchar(255) null, "request_id" varchar(255) null, "created_at" timestamptz not null);`,
    );
    this.addSql(
      `create index "audit_log_entity_name_entity_id_index" on "audit_log" ("entity_name", "entity_id");`,
    );
    this.addSql(
      `alter table "audit_log" add constraint "audit_log_action_check" check ("action" in ('create', 'update', 'delete'));`,
    );

    this.addSql(
      `create table "category" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "name" varchar(255) not null, "description" text not null);`,
    );
    this.addSql(`create index "category_idx_index" on "category" ("idx");`);
    this.addSql(`create index "category_is_deleted_index" on "category" ("is_deleted");`);
    this.addSql(`create index "category_name_index" on "category" ("name");`);

    this.addSql(
      `create table "conversation" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "chat_name" varchar(255) not null);`,
    );
    this.addSql(`create index "conversation_idx_index" on "conversation" ("idx");`);
    this.addSql(`create index "conversation_is_deleted_index" on "conversation" ("is_deleted");`);
    this.addSql(`create index "conversation_chat_name_index" on "conversation" ("chat_name");`);

    this.addSql(
      `create table "news_letter" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "name" varchar(255) not null, "content" text not null, "sent_at" timestamptz null);`,
    );
    this.addSql(`create index "news_letter_idx_index" on "news_letter" ("idx");`);
    this.addSql(`create index "news_letter_is_deleted_index" on "news_letter" ("is_deleted");`);
    this.addSql(`create index "news_letter_name_index" on "news_letter" ("name");`);
    this.addSql(
      `alter table "news_letter" add constraint "news_letter_name_unique" unique ("name");`,
    );

    this.addSql(
      `create table "protocol" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "otp_expiry_in_minutes" int not null);`,
    );
    this.addSql(`create index "protocol_idx_index" on "protocol" ("idx");`);
    this.addSql(`create index "protocol_is_deleted_index" on "protocol" ("is_deleted");`);

    this.addSql(
      `create table "subscriber" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "email" varchar(255) not null);`,
    );
    this.addSql(`create index "subscriber_idx_index" on "subscriber" ("idx");`);
    this.addSql(`create index "subscriber_is_deleted_index" on "subscriber" ("is_deleted");`);
    this.addSql(`create index "subscriber_email_index" on "subscriber" ("email");`);
    this.addSql(
      `alter table "subscriber" add constraint "subscriber_email_unique" unique ("email");`,
    );

    this.addSql(
      `create table "tag" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "title" varchar(50) not null, "description" text not null, "slug" varchar(255) null);`,
    );
    this.addSql(`create index "tag_idx_index" on "tag" ("idx");`);
    this.addSql(`create index "tag_is_deleted_index" on "tag" ("is_deleted");`);
    this.addSql(`create index "tag_title_index" on "tag" ("title");`);
    this.addSql(`alter table "tag" add constraint "tag_title_unique" unique ("title");`);
    this.addSql(`create index "tag_slug_index" on "tag" ("slug");`);

    this.addSql(
      `create table "user" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "first_name" varchar(255) not null, "middle_name" varchar(255) null, "last_name" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "bio" text not null, "avatar" text not null, "password" text not null, "two_factor_secret" varchar(255) null, "is_two_factor_enabled" boolean null default false, "roles" text[] null, "mobile_number" varchar(255) null, "is_verified" boolean null default false, "social" jsonb null, "last_login" timestamptz null);`,
    );
    this.addSql(`create index "user_idx_index" on "user" ("idx");`);
    this.addSql(`create index "user_is_deleted_index" on "user" ("is_deleted");`);
    this.addSql(`create index "user_username_index" on "user" ("username");`);
    this.addSql(`alter table "user" add constraint "user_username_unique" unique ("username");`);
    this.addSql(`create index "user_email_index" on "user" ("email");`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
    this.addSql(`create index "user_roles_index" on "user" ("roles");`);
    this.addSql(`create index "user_mobile_number_index" on "user" ("mobile_number");`);
    this.addSql(
      `alter table "user" add constraint "user_mobile_number_unique" unique ("mobile_number");`,
    );
    this.addSql(
      `alter table "user" add constraint "user_roles_not_empty_check" check (cardinality(roles) > 0);`,
    );
    this.addSql(
      `alter table "user" add constraint "user_roles_check" check ("roles" <@ array['ADMIN'::text, 'AUTHOR'::text]);`,
    );

    this.addSql(
      `create table "refresh_token" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "expires_in" timestamptz not null, "user_id" int not null, "ip_address" varchar(45) null, "user_agent" varchar(512) null, "is_revoked" boolean not null default false);`,
    );
    this.addSql(`create index "refresh_token_idx_index" on "refresh_token" ("idx");`);
    this.addSql(`create index "refresh_token_is_deleted_index" on "refresh_token" ("is_deleted");`);
    this.addSql(`create index "refresh_token_user_id_index" on "refresh_token" ("user_id");`);
    this.addSql(`create index "refresh_token_is_revoked_index" on "refresh_token" ("is_revoked");`);

    this.addSql(
      `create table "referral" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "referrer_id" int not null, "mobile_number" varchar(255) not null, "status" text not null default 'PENDING');`,
    );
    this.addSql(`create index "referral_idx_index" on "referral" ("idx");`);
    this.addSql(`create index "referral_is_deleted_index" on "referral" ("is_deleted");`);
    this.addSql(`create index "referral_referrer_id_index" on "referral" ("referrer_id");`);
    this.addSql(`create index "referral_mobile_number_index" on "referral" ("mobile_number");`);
    this.addSql(`create index "referral_status_index" on "referral" ("status");`);
    this.addSql(
      `alter table "referral" add constraint "referral_status_check" check ("status" in ('PENDING', 'COMPLETED'));`,
    );

    this.addSql(
      `create table "post" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "slug" varchar(255) null, "title" varchar(255) not null, "description" text not null, "content" text not null, "reading_time" int not null default 0, "read_count" int not null default 0, "published" boolean not null default false, "favorites_count" int not null default 0, "version" int not null default 1, "author_id" int not null, "search_vector" tsvector generated always as (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B') || setweight(to_tsvector('english', coalesce(content, '')), 'C')) stored null, "state" text not null default 'DRAFT');`,
    );
    this.addSql(`create index "post_idx_index" on "post" ("idx");`);
    this.addSql(`create index "post_is_deleted_index" on "post" ("is_deleted");`);
    this.addSql(`create index "post_slug_index" on "post" ("slug");`);
    this.addSql(`create index "post_title_index" on "post" ("title");`);
    this.addSql(`create index "post_published_index" on "post" ("published");`);
    this.addSql(`create index "post_author_id_index" on "post" ("author_id");`);
    this.addSql(`create index "post_search_vector_index" on "post" using gin ("search_vector");`);
    this.addSql(
      `alter table "post" add constraint "post_reading_time_check" check (reading_time >= 0);`,
    );
    this.addSql(
      `alter table "post" add constraint "post_favorites_count_check" check (favorites_count >= 0);`,
    );
    this.addSql(
      `alter table "post" add constraint "post_state_check" check ("state" in ('DRAFT', 'PUBLISHED'));`,
    );

    this.addSql(
      `create table "post_tags" ("post_id" int not null, "tag_id" int not null, primary key ("post_id", "tag_id"));`,
    );

    this.addSql(
      `create table "post_categories" ("post_id" int not null, "category_id" int not null, primary key ("post_id", "category_id"));`,
    );

    this.addSql(
      `create table "otp_log" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "expires_in" timestamptz not null, "otp_code" varchar(20) null, "user_id" int not null, "purpose" text not null default 'RESET_PASSWORD', "is_used" boolean not null default false);`,
    );
    this.addSql(`create index "otp_log_idx_index" on "otp_log" ("idx");`);
    this.addSql(`create index "otp_log_is_deleted_index" on "otp_log" ("is_deleted");`);
    this.addSql(`create index "otp_log_otp_code_index" on "otp_log" ("otp_code");`);
    this.addSql(`create index "otp_log_user_id_index" on "otp_log" ("user_id");`);
    this.addSql(
      `alter table "otp_log" add constraint "otp_log_purpose_check" check ("purpose" in ('RESET_PASSWORD', 'VERIFY_EMAIL'));`,
    );

    this.addSql(
      `create table "message" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "body" varchar(255) not null, "sender_id" int not null, "conversation_id" int not null, "is_read" boolean not null default false, "read_at" timestamptz null);`,
    );
    this.addSql(`create index "message_idx_index" on "message" ("idx");`);
    this.addSql(`create index "message_is_deleted_index" on "message" ("is_deleted");`);
    this.addSql(`create index "message_sender_id_index" on "message" ("sender_id");`);
    this.addSql(`create index "message_conversation_id_index" on "message" ("conversation_id");`);

    this.addSql(
      `create table "comment" ("id" serial primary key, "idx" varchar(255) null, "is_active" boolean null default true, "is_deleted" boolean null default false, "deleted_at" timestamptz null, "created_at" timestamptz null, "updated_at" timestamptz null, "body" varchar(255) not null, "post_id" int not null, "author_id" int not null);`,
    );
    this.addSql(`create index "comment_idx_index" on "comment" ("idx");`);
    this.addSql(`create index "comment_is_deleted_index" on "comment" ("is_deleted");`);
    this.addSql(`create index "comment_post_id_index" on "comment" ("post_id");`);
    this.addSql(`create index "comment_author_id_index" on "comment" ("author_id");`);

    this.addSql(
      `create table "user_conversations" ("user_id" int not null, "conversation_id" int not null, primary key ("user_id", "conversation_id"));`,
    );

    this.addSql(
      `create table "user_favorites" ("user_id" int not null, "post_id" int not null, primary key ("user_id", "post_id"));`,
    );

    this.addSql(
      `create table "user_to_follower" ("follower" int not null, "following" int not null, primary key ("follower", "following"));`,
    );

    this.addSql(
      `alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id");`,
    );

    this.addSql(
      `alter table "referral" add constraint "referral_referrer_id_foreign" foreign key ("referrer_id") references "user" ("id");`,
    );

    this.addSql(
      `alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id");`,
    );

    this.addSql(
      `alter table "post_tags" add constraint "post_tags_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "post_tags" add constraint "post_tags_tag_id_foreign" foreign key ("tag_id") references "tag" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "post_categories" add constraint "post_categories_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "post_categories" add constraint "post_categories_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "otp_log" add constraint "otp_log_user_id_foreign" foreign key ("user_id") references "user" ("id");`,
    );

    this.addSql(
      `alter table "message" add constraint "message_sender_id_foreign" foreign key ("sender_id") references "user" ("id");`,
    );
    this.addSql(
      `alter table "message" add constraint "message_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id");`,
    );

    this.addSql(
      `alter table "comment" add constraint "comment_post_id_foreign" foreign key ("post_id") references "post" ("id");`,
    );
    this.addSql(
      `alter table "comment" add constraint "comment_author_id_foreign" foreign key ("author_id") references "user" ("id");`,
    );

    this.addSql(
      `alter table "user_conversations" add constraint "user_conversations_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "user_conversations" add constraint "user_conversations_conversation_id_foreign" foreign key ("conversation_id") references "conversation" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "user_favorites" add constraint "user_favorites_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "user_favorites" add constraint "user_favorites_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "user_to_follower" add constraint "user_to_follower_follower_foreign" foreign key ("follower") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "user_to_follower" add constraint "user_to_follower_following_foreign" foreign key ("following") references "user" ("id") on update cascade on delete cascade;`,
    );
  }
}
