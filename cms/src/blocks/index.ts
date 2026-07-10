/**
 * Editable page blocks — the "page builder".
 *
 * Each block below maps to one section of the customer's reference design
 * (../../orion-media-website.html). An admin composes a page by adding /
 * reordering these blocks in the Payload panel — no code, no redeploy. The
 * public site (src/app/(frontend)) renders one React component per block.
 */
import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    {
      name: 'lines',
      type: 'array',
      label: 'Headline lines',
      admin: { description: 'Each line animates in. Last line is highlighted gold.' },
      fields: [{ name: 'text', type: 'text', required: true }],
      defaultValue: [{ text: 'Aim.' }, { text: 'Air.' }, { text: 'Amplify.' }],
    },
    { name: 'lead', type: 'textarea', label: 'Lead paragraph' },
    { name: 'arabicLine', type: 'text', label: 'Arabic line (optional)' },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true, defaultValue: '#contact' },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary (filled)', value: 'primary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
      ],
    },
  ],
}

export const MarqueeBlock: Block = {
  slug: 'marquee',
  labels: { singular: 'Marquee strip', plural: 'Marquee strips' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Scrolling names',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
  ],
}

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: 'About section', plural: 'About sections' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Who we are' },
    { name: 'heading', type: 'text' },
    {
      name: 'body',
      type: 'textarea',
      admin: { description: 'One paragraph per line. Blank line = new paragraph.' },
    },
  ],
}

export const PillarsBlock: Block = {
  slug: 'pillars',
  labels: { singular: 'Pillars section', plural: 'Pillars sections' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'How we work' },
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'pillars',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Number / label (e.g. "01 — AIM")' },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Services section', plural: 'Services sections' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'What we do' },
    { name: 'heading', type: 'text', defaultValue: 'Services' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'services',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}

export const ClientsBlock: Block = {
  slug: 'clients',
  labels: { singular: 'Clients section', plural: 'Clients sections' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Trusted by' },
    { name: 'heading', type: 'text', defaultValue: 'Clients & Partners' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'clients',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'tag', type: 'text', label: 'Sub-label' },
      ],
    },
    { name: 'note', type: 'textarea', label: 'Footnote' },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Contact section', plural: 'Contact sections' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Get in touch' },
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'email', type: 'text' },
    {
      name: 'details',
      type: 'array',
      label: 'Contact detail lines',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
  ],
}

export const layoutBlocks = [
  HeroBlock,
  MarqueeBlock,
  AboutBlock,
  PillarsBlock,
  ServicesBlock,
  ClientsBlock,
  ContactBlock,
]
