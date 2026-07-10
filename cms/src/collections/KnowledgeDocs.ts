import type { CollectionConfig } from 'payload'

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
          // Non-fatal: saving the doc must succeed even if the chat service
          // is momentarily down. A re-save re-ingests.
          console.error('Knowledge ingest failed:', err)
        }
        return doc
      },
    ],
  },
}
