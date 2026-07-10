import type { CollectionConfig } from 'payload'

/** Admin panel logins. `auth: true` gives Payload's built-in login/session. */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin (full access)', value: 'admin' },
        { label: 'Editor (content only)', value: 'editor' },
      ],
    },
  ],
}
