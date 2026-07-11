import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Media library — logos and images the client uploads and reuses.
 *
 * NOTE (production): files save to the local `media/` folder. On Render's free
 * tier the disk is EPHEMERAL — uploads are wiped on each deploy/restart. Fine
 * for a click-around demo. Before real launch, switch to cloud storage
 * (@payloadcms/storage-s3 → S3 / Cloudflare R2) or a Render persistent disk.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // public — images must load on the site
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 900 },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', type: 'text', label: 'Alt text (accessibility)' }],
}
