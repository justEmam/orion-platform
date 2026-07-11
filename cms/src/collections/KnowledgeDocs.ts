import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'

/**
 * KnowledgeDocs — the bridge between "editable content" and "what the AI knows".
 *
 * Admins paste or upload support material here (FAQs, service details, policies).
 * On save, an afterChange hook POSTs the text to the chat service /ingest
 * endpoint, which chunks + embeds it into pgvector. The support chat then
 * answers ONLY from these docs, and escalates to a human for anything not
 * covered. So the client curates the bot's knowledge with zero code.
 */
export const KnowledgeDocs: CollectionConfig = {
  slug: 'knowledge-docs',
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
    description: 'Documents the support assistant is allowed to answer from.',
    defaultColumns: ['title', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: { description: 'Plain text the assistant can quote from.' },
    },
  ],
  hooks: {
    // On save -> push the raw Q&A text to the chat service (it stores it for
    // prompt-stuffing). On delete -> tell the chat service to drop it.
    afterChange: [
      async ({ doc }) => {
        const url = process.env.CHAT_INGEST_URL
        if (!url) return doc
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: `knowledge-doc:${doc.id}`,
              text: `${doc.title}\n\n${doc.content}`,
            }),
          })
        } catch (err) {
          console.error('Knowledge ingest failed:', err)
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const base = process.env.CHAT_INGEST_URL
        if (!base) return doc
        try {
          await fetch(base.replace(/\/ingest$/, '/ingest/delete'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: `knowledge-doc:${doc.id}` }),
          })
        } catch (err) {
          console.error('Knowledge delete failed:', err)
        }
        return doc
      },
    ],
  },
}
