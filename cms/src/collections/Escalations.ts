import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'

/**
 * Escalations — chat questions the assistant couldn't answer, saved here for
 * the team to follow up (NOT emailed). The chat service POSTs a record when it
 * escalates; admins/editors see the list in the dashboard and tick "handled"
 * once they've replied to the visitor.
 *
 * `create` is public so the chat service can post without a login. Everything
 * else is admin/editor only.
 */
export const Escalations: CollectionConfig = {
  slug: 'escalations',
  access: {
    // Allow create ONLY for the chat service (unauthenticated API — no user).
    // Logged-in humans get `false`, which also hides the admin "Create New"
    // button — so the panel is read/handle-only, exactly as intended.
    create: ({ req: { user } }) => !user,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'name', 'email', 'handled', 'createdAt'],
    description: 'Visitor questions the chatbot passed to the team.',
  },
  fields: [
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tick once you have replied to this visitor.' },
    },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'company', type: 'text' },
    { name: 'job', type: 'text' },
    {
      name: 'details',
      type: 'textarea',
      admin: {
        description:
          'All contact-form fields the visitor filled (covers custom fields).',
      },
    },
    { name: 'question', type: 'textarea', required: true },
    {
      name: 'transcript',
      type: 'textarea',
      admin: { description: 'Recent conversation leading to the handoff.' },
    },
  ],
}
