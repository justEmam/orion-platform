/**
 * Role-based access control.
 *
 *   admin  — full control: content + users + settings.
 *   editor — content only: create/edit/delete pages, media, knowledge docs,
 *            and edit the globals; but CANNOT manage users.
 *
 * Attached to each collection/global's `access`. Public read stays open where
 * needed (the site must render pages for visitors).
 */
import type { Access } from 'payload'

const roleOf = (user: any): string | undefined => user?.role

/** Any logged-in admin OR editor. */
export const isAdminOrEditor: Access = ({ req: { user } }) =>
  roleOf(user) === 'admin' || roleOf(user) === 'editor'

/** Admins only. */
export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

/** Admins only, as a boolean (for field-level / admin.hidden checks). */
export const isAdminBool = ({ req: { user } }: any) => roleOf(user) === 'admin'
