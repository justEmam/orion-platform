import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_chat_contact_fields_type" AS ENUM('text', 'email');
  CREATE TYPE "public"."enum__chat_v_version_contact_fields_type" AS ENUM('text', 'email');
  CREATE TABLE "chat_contact_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_chat_contact_fields_type" DEFAULT 'text',
  	"required" boolean DEFAULT true
  );
  
  CREATE TABLE "_chat_v_version_contact_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__chat_v_version_contact_fields_type" DEFAULT 'text',
  	"required" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  ALTER TABLE "escalations" ADD COLUMN "details" varchar;
  ALTER TABLE "chat" ADD COLUMN "contact_intro" varchar DEFAULT 'Please introduce yourself so our team can follow up:';
  ALTER TABLE "chat" ADD COLUMN "start_button_label" varchar DEFAULT 'Start chat';
  ALTER TABLE "chat" ADD COLUMN "start_button_color" varchar DEFAULT '#4c7cff';
  ALTER TABLE "chat" ADD COLUMN "start_button_text_color" varchar DEFAULT '#ffffff';
  ALTER TABLE "_chat_v" ADD COLUMN "version_contact_intro" varchar DEFAULT 'Please introduce yourself so our team can follow up:';
  ALTER TABLE "_chat_v" ADD COLUMN "version_start_button_label" varchar DEFAULT 'Start chat';
  ALTER TABLE "_chat_v" ADD COLUMN "version_start_button_color" varchar DEFAULT '#4c7cff';
  ALTER TABLE "_chat_v" ADD COLUMN "version_start_button_text_color" varchar DEFAULT '#ffffff';
  ALTER TABLE "chat_contact_fields" ADD CONSTRAINT "chat_contact_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chat_v_version_contact_fields" ADD CONSTRAINT "_chat_v_version_contact_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chat_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "chat_contact_fields_order_idx" ON "chat_contact_fields" USING btree ("_order");
  CREATE INDEX "chat_contact_fields_parent_id_idx" ON "chat_contact_fields" USING btree ("_parent_id");
  CREATE INDEX "_chat_v_version_contact_fields_order_idx" ON "_chat_v_version_contact_fields" USING btree ("_order");
  CREATE INDEX "_chat_v_version_contact_fields_parent_id_idx" ON "_chat_v_version_contact_fields" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "chat_contact_fields" CASCADE;
  DROP TABLE "_chat_v_version_contact_fields" CASCADE;
  ALTER TABLE "escalations" DROP COLUMN "details";
  ALTER TABLE "chat" DROP COLUMN "contact_intro";
  ALTER TABLE "chat" DROP COLUMN "start_button_label";
  ALTER TABLE "chat" DROP COLUMN "start_button_color";
  ALTER TABLE "chat" DROP COLUMN "start_button_text_color";
  ALTER TABLE "_chat_v" DROP COLUMN "version_contact_intro";
  ALTER TABLE "_chat_v" DROP COLUMN "version_start_button_label";
  ALTER TABLE "_chat_v" DROP COLUMN "version_start_button_color";
  ALTER TABLE "_chat_v" DROP COLUMN "version_start_button_text_color";
  DROP TYPE "public"."enum_chat_contact_fields_type";
  DROP TYPE "public"."enum__chat_v_version_contact_fields_type";`)
}
