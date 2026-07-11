import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_brand_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brand_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_navigation_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_chat_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__chat_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_brand_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_text" varchar DEFAULT 'ORION MEDIA',
  	"version_cta_label" varchar DEFAULT 'Start a Campaign',
  	"version_cta_href" varchar DEFAULT '#contact',
  	"version_colors_void_black" varchar DEFAULT '#05050b',
  	"version_colors_beam_blue" varchar DEFAULT '#4c7cff',
  	"version_colors_gold" varchar DEFAULT '#d6b370',
  	"version_colors_text" varchar DEFAULT '#f5f6fb',
  	"version_colors_text_muted" varchar DEFAULT '#a2a6c4',
  	"version_seeded" boolean,
  	"version__status" "enum__brand_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_navigation_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_copyright" varchar DEFAULT '© 2026 Orion Media. Aim. Air. Amplify.',
  	"version_seeded" boolean,
  	"version__status" "enum__navigation_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_chat_v_version_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"question" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_chat_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_assistant_name" varchar DEFAULT 'Orion Assistant',
  	"version_status_text" varchar DEFAULT 'Online now',
  	"version_greeting" varchar DEFAULT 'Hi, I''m Orion — your media assistant. Ask me anything about our services, clients, or how to get started.',
  	"version_placeholder" varchar DEFAULT 'Ask about campaigns, services…',
  	"version_launcher_color" varchar DEFAULT '#4c7cff',
  	"version_header_accent" varchar DEFAULT '#4c7cff',
  	"version_panel_bg" varchar DEFAULT '#0d0f24',
  	"version_user_bubble_color" varchar DEFAULT '#4c7cff',
  	"version_bot_bubble_color" varchar DEFAULT '#1a1f3d',
  	"version_text_color" varchar DEFAULT '#f5f6fb',
  	"version_seeded" boolean,
  	"version__status" "enum__chat_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "navigation_links" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "navigation_links" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "navigation_social" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "navigation_social" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "chat_chips" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "chat_chips" ALTER COLUMN "question" DROP NOT NULL;
  ALTER TABLE "brand" ADD COLUMN "_status" "enum_brand_status" DEFAULT 'draft';
  ALTER TABLE "navigation" ADD COLUMN "_status" "enum_navigation_status" DEFAULT 'draft';
  ALTER TABLE "chat" ADD COLUMN "panel_bg" varchar DEFAULT '#0d0f24';
  ALTER TABLE "chat" ADD COLUMN "bot_bubble_color" varchar DEFAULT '#1a1f3d';
  ALTER TABLE "chat" ADD COLUMN "text_color" varchar DEFAULT '#f5f6fb';
  ALTER TABLE "chat" ADD COLUMN "_status" "enum_chat_status" DEFAULT 'draft';
  ALTER TABLE "_navigation_v_version_links" ADD CONSTRAINT "_navigation_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_social" ADD CONSTRAINT "_navigation_v_version_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chat_v_version_chips" ADD CONSTRAINT "_chat_v_version_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chat_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_brand_v_version_version__status_idx" ON "_brand_v" USING btree ("version__status");
  CREATE INDEX "_brand_v_created_at_idx" ON "_brand_v" USING btree ("created_at");
  CREATE INDEX "_brand_v_updated_at_idx" ON "_brand_v" USING btree ("updated_at");
  CREATE INDEX "_brand_v_latest_idx" ON "_brand_v" USING btree ("latest");
  CREATE INDEX "_navigation_v_version_links_order_idx" ON "_navigation_v_version_links" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_links_parent_id_idx" ON "_navigation_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_social_order_idx" ON "_navigation_v_version_social" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_social_parent_id_idx" ON "_navigation_v_version_social" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_version__status_idx" ON "_navigation_v" USING btree ("version__status");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_navigation_v_latest_idx" ON "_navigation_v" USING btree ("latest");
  CREATE INDEX "_chat_v_version_chips_order_idx" ON "_chat_v_version_chips" USING btree ("_order");
  CREATE INDEX "_chat_v_version_chips_parent_id_idx" ON "_chat_v_version_chips" USING btree ("_parent_id");
  CREATE INDEX "_chat_v_version_version__status_idx" ON "_chat_v" USING btree ("version__status");
  CREATE INDEX "_chat_v_created_at_idx" ON "_chat_v" USING btree ("created_at");
  CREATE INDEX "_chat_v_updated_at_idx" ON "_chat_v" USING btree ("updated_at");
  CREATE INDEX "_chat_v_latest_idx" ON "_chat_v" USING btree ("latest");
  CREATE INDEX "brand__status_idx" ON "brand" USING btree ("_status");
  CREATE INDEX "navigation__status_idx" ON "navigation" USING btree ("_status");
  CREATE INDEX "chat__status_idx" ON "chat" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_brand_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v_version_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v_version_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chat_v_version_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chat_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_brand_v" CASCADE;
  DROP TABLE "_navigation_v_version_links" CASCADE;
  DROP TABLE "_navigation_v_version_social" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_chat_v_version_chips" CASCADE;
  DROP TABLE "_chat_v" CASCADE;
  DROP INDEX "brand__status_idx";
  DROP INDEX "navigation__status_idx";
  DROP INDEX "chat__status_idx";
  ALTER TABLE "navigation_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "navigation_links" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "navigation_social" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "navigation_social" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "chat_chips" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "chat_chips" ALTER COLUMN "question" SET NOT NULL;
  ALTER TABLE "brand" DROP COLUMN "_status";
  ALTER TABLE "navigation" DROP COLUMN "_status";
  ALTER TABLE "chat" DROP COLUMN "panel_bg";
  ALTER TABLE "chat" DROP COLUMN "bot_bubble_color";
  ALTER TABLE "chat" DROP COLUMN "text_color";
  ALTER TABLE "chat" DROP COLUMN "_status";
  DROP TYPE "public"."enum_brand_status";
  DROP TYPE "public"."enum__brand_v_version_status";
  DROP TYPE "public"."enum_navigation_status";
  DROP TYPE "public"."enum__navigation_v_version_status";
  DROP TYPE "public"."enum_chat_status";
  DROP TYPE "public"."enum__chat_v_version_status";`)
}
