import type { GlobalConfig } from 'payload'

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

/** Nav + footer links and social — editable without touching code. */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    livePreview: { url: `${baseURL}/?preview=true` },
    preview: () => `${baseURL}/?preview=true`,
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Header nav links',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
      defaultValue: [
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Clients', href: '#clients' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      name: 'social',
      type: 'array',
      label: 'Footer social links',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'copyright', type: 'text', defaultValue: '© 2026 Orion Media. Aim. Air. Amplify.' },
    // Hidden flag: set true by the seed on first run so restarts never
    // overwrite the customer's nav edits. Not shown in the admin.
    { name: 'seeded', type: 'checkbox', admin: { hidden: true } },
  ],
}
