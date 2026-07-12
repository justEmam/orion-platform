import path from 'path'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'

/**
 * Media library — logos and images the client uploads and reuses.
 *
 * Uploads land in <cwd>/media — i.e. /app/media in the container, which
 * docker-compose.prod.yml mounts as the named volume `cms_media`, so uploaded
 * files SURVIVE container rebuilds/redeploys. (cwd-based on purpose: a path
 * derived from import.meta.url is unpredictable after Next bundles the config.)
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
    staticDir: path.resolve(process.cwd(), 'media'),
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 900 },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', type: 'text', label: 'Alt text (accessibility)' }],
}
