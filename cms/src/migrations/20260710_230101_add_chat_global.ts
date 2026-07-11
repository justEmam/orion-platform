import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "chat_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"question" varchar NOT NULL
  );
  
  CREATE TABLE "chat" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"assistant_name" varchar DEFAULT 'Orion Assistant',
  	"status_text" varchar DEFAULT 'Online now',
  	"greeting" varchar DEFAULT 'Hi, I''m Orion — your media assistant. Ask me anything about our services, clients, or how to get started.',
  	"placeholder" varchar DEFAULT 'Ask about campaigns, services…',
  	"launcher_color" varchar DEFAULT '#4c7cff',
  	"user_bubble_color" varchar DEFAULT '#4c7cff',
  	"header_accent" varchar DEFAULT '#4c7cff',
  	"seeded" boolean,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "chat_chips" ADD CONSTRAINT "chat_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "chat_chips_order_idx" ON "chat_chips" USING btree ("_order");
  CREATE INDEX "chat_chips_parent_id_idx" ON "chat_chips" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "chat_chips" CASCADE;
  DROP TABLE "chat" CASCADE;`)
}
