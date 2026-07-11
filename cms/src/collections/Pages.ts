import type { CollectionConfig } from 'payload'
import { layoutBlocks } from '../blocks'
import { isAdminOrEditor } from '../access'

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

/** The public URL for a page, given its slug ("home" lives at /). */
const pathForSlug = (slug?: string | null) =>
  !slug || slug === 'home' ? '/' : `/${slug}`

/**
 * Pages — the editable site. The `layout` field is an ordered list of blocks,
 * which is what gives admins the "add / reorder sections" page-builder feel.
 * Draft/publish is enabled so the client can preview before going live.
 *
 * Live Preview shows the ACTUAL page next to the edit fields and updates as the
 * client types — so they never have to think in terms of "blocks".
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    // Side-by-side live preview inside the edit view.
    livePreview: {
      url: ({ data }) => `${baseURL}${pathForSlug(data?.slug)}?preview=true`,
    },
    // A "preview" button that opens the page in a new tab too.
    preview: (doc) => `${baseURL}${pathForSlug((doc as any)?.slug)}?preview=true`,
  },
  access: {
    read: () => true, // public — the site must render pages for visitors
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: 'home',
      admin: { description: 'URL path. "home" renders at /.' },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page sections',
      blocks: layoutBlocks,
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Link Sharing',
      admin: {
        description:
          'Controls how this page looks in Google and when the link is shared (WhatsApp, LinkedIn, etc.).',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description:
              'The clickable headline in Google + the bold title on shared-link cards. ~60 characters.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description:
              'The grey summary under the title in Google + on shared-link cards. ~150 characters.',
          },
        },
        {
          name: 'shareImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'The big picture shown when the link is shared on social/chat apps. Best size: 1200×630px.',
          },
        },
      ],
    },
  ],
}
