import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "escalations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"handled" boolean DEFAULT false,
  	"name" varchar,
  	"email" varchar,
  	"company" varchar,
  	"job" varchar,
  	"question" varchar NOT NULL,
  	"transcript" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "escalations_id" integer;
  CREATE INDEX "escalations_updated_at_idx" ON "escalations" USING btree ("updated_at");
  CREATE INDEX "escalations_created_at_idx" ON "escalations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_escalations_fk" FOREIGN KEY ("escalations_id") REFERENCES "public"."escalations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_escalations_id_idx" ON "payload_locked_documents_rels" USING btree ("escalations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "escalations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "escalations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_escalations_fk";
  
  DROP INDEX "payload_locked_documents_rels_escalations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "escalations_id";`)
}
