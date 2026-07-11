import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { KnowledgeDocs } from './collections/KnowledgeDocs'
import { Escalations } from './collections/Escalations'
import { Users } from './collections/Users'
import { Brand } from './globals/Brand'
import { Navigation } from './globals/Navigation'
import { Chat } from './globals/Chat'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: { user: Users.slug },
  editor: lexicalEditor(),
  collections: [Pages, Media, KnowledgeDocs, Escalations, Users],
  globals: [Brand, Navigation, Chat],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp, // enables image uploads + resizing in the Media library
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: {
      // Shared Postgres with the chat service. Payload uses plain postgres://;
      // the chat service uses postgresql+psycopg:// against the SAME db.
      connectionString: process.env.DATABASE_URI || '',
    },
    // Production-safe: use committed migration files (src/migrations), NOT
    // interactive push. `push` prompts for table create/rename which hangs on
    // a server. Migrations run non-interactively at deploy (see entrypoint).
    // For local dev you can temporarily set this true if you change the schema
    // and want auto-sync, then generate a migration before committing.
    push: process.env.PAYLOAD_PUSH === 'true',
  }),
})
