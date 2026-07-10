import type { GlobalConfig } from 'payload'

// A color field rendered with the clickable swatch picker (see
// src/fields/ColorPicker.tsx). Stores a plain hex string.
const colorField = (name: string, label: string, defaultValue: string) => ({
  name,
  type: 'text' as const,
  label,
  defaultValue,
  admin: {
    components: {
      Field: '@/fields/ColorPicker#ColorPicker',
    },
  },
})

/**
 * Brand — site-wide theme. These map to the CSS custom properties in the
 * reference design (--gold, --beam-blue, etc.); the site injects them at
 * render time (see (frontend)/BrandStyle.tsx), so changing a color here
 * re-themes the whole site. Colors use a clickable picker, not hex typing.
 */
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export const Brand: GlobalConfig = {
  slug: 'brand',
  admin: {
    // Live Preview: editing brand colors/logo shows the home page re-theming
    // in a side-by-side pane.
    livePreview: { url: `${baseURL}/?preview=true` },
    preview: () => `${baseURL}/?preview=true`,
  },
  fields: [
    { name: 'logoText', type: 'text', defaultValue: 'ORION MEDIA' },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Start a Campaign' },
    { name: 'ctaHref', type: 'text', defaultValue: '#contact' },
    {
      name: 'colors',
      type: 'group',
      label: 'Theme colors',
      fields: [
        colorField('voidBlack', 'Background (void black)', '#05050b'),
        colorField('beamBlue', 'Accent (beam blue)', '#4c7cff'),
        colorField('gold', 'Highlight (gold)', '#d6b370'),
        colorField('text', 'Text', '#f5f6fb'),
        colorField('textMuted', 'Muted text', '#a2a6c4'),
      ],
    },
    // Hidden flag: set true by the seed on first run so restarts never
    // overwrite the customer's edits. Not shown in the admin.
    { name: 'seeded', type: 'checkbox', admin: { hidden: true } },
  ],
}
