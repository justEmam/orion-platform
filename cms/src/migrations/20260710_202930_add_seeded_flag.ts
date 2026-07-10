import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brand" ADD COLUMN "seeded" boolean;
  ALTER TABLE "navigation" ADD COLUMN "seeded" boolean;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brand" DROP COLUMN "seeded";
  ALTER TABLE "navigation" DROP COLUMN "seeded";`)
}
