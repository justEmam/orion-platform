import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brand" ADD COLUMN "favicon_id" integer;
  ALTER TABLE "_brand_v" ADD COLUMN "version_favicon_id" integer;
  ALTER TABLE "brand" ADD CONSTRAINT "brand_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brand_v" ADD CONSTRAINT "_brand_v_version_favicon_id_media_id_fk" FOREIGN KEY ("version_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "brand_favicon_idx" ON "brand" USING btree ("favicon_id");
  CREATE INDEX "_brand_v_version_version_favicon_idx" ON "_brand_v" USING btree ("version_favicon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brand" DROP CONSTRAINT "brand_favicon_id_media_id_fk";
  
  ALTER TABLE "_brand_v" DROP CONSTRAINT "_brand_v_version_favicon_id_media_id_fk";
  
  DROP INDEX "brand_favicon_idx";
  DROP INDEX "_brand_v_version_version_favicon_idx";
  ALTER TABLE "brand" DROP COLUMN "favicon_id";
  ALTER TABLE "_brand_v" DROP COLUMN "version_favicon_id";`)
}
