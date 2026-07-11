import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminBool } from '../access'

/** Admin panel logins. `auth: true` gives Payload's built-in login/session.
 *  User management is ADMIN-ONLY — editors cannot create/edit/delete users. */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    // Hide the Users collection from the sidebar for non-admins.
    hidden: ({ user }) => (user as any)?.role !== 'admin',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    update: isAdmin,
    // A user can always read their own record (needed for login/session);
    // otherwise only admins can list users.
    read: ({ req: { user }, id }) =>
      (user as any)?.role === 'admin' || (!!user && user.id === id),
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      // Only admins can change a role (so an editor can't promote themselves).
      access: { update: isAdminBool, create: isAdminBool },
      options: [
        { label: 'Admin (full access)', value: 'admin' },
        { label: 'Editor (content only)', value: 'editor' },
      ],
    },
  ],
}
