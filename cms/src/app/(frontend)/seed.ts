/**
 * Seed content = the reference design's original copy, in block shape.
 * Used as the demo fallback until the client populates the CMS, and also as the
 * data you import into Payload on first run (Phase 2 seed script).
 */
export const seedBrand = {
  logoText: 'ORION MEDIA',
  ctaLabel: 'Start a Campaign',
  ctaHref: '#contact',
  colors: {
    voidBlack: '#05050b',
    beamBlue: '#4c7cff',
    gold: '#d6b370',
    text: '#f5f6fb',
    textMuted: '#a2a6c4',
  },
}

export const seedNav = {
  links: [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Clients', href: '#clients' },
    { label: 'Contact', href: '#contact' },
  ],
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Contact', href: '#contact' },
  ],
  copyright: '© 2026 Orion Media. Aim. Air. Amplify.',
}

export const seedLayout = [
  {
    blockType: 'hero',
    lines: [{ text: 'Aim.' }, { text: 'Air.' }, { text: 'Amplify.' }],
    lead: 'Orion Media is a full-service media agency headquartered in Abu Dhabi — we plan the strategy, buy the airtime, produce the story, and amplify it across every screen that matters.',
    arabicLine: 'أوريون ميديا — نخطّط، نُنتج، ونُضخّم أثر حملتكم الإعلانية',
    buttons: [
      { label: 'Request a Meeting →', href: '#contact', style: 'primary' },
      { label: 'See Who We Work With', href: '#clients', style: 'outline' },
    ],
  },
  {
    blockType: 'marquee',
    items: [
      'Emirates News Agency · WAM', 'National Media Authority', 'GCAA', 'Dubai Culture',
      'MADO', 'e&', 'Zee Network', 'GDRFA Abu Dhabi', 'Drake & Skull',
      'Dubai Municipality', "Prime Minister's Office",
    ].map((text) => ({ text })),
  },
  {
    blockType: 'about',
    eyebrow: 'Who we are',
    heading: 'An independent media agency, engineered for the pace of live campaigns.',
    body:
      'Orion Media is a full-service agency headquartered in Abu Dhabi, partnering with broadcasters, brands and government institutions to plan, buy, produce and distribute campaigns across the UAE and the wider region.\n\n' +
      'Like the belt of the constellation it takes its name from, our work is fixed on three points: a precise Aim on strategy, a commanding presence On-Air, and creative built to Amplify.',
  },
  {
    blockType: 'pillars',
    eyebrow: 'How we work',
    heading: 'Three pillars. One trajectory.',
    intro: 'Every campaign we run moves through the same disciplined arc — from precision targeting to broadcast to lasting reach.',
    pillars: [
      { label: '01 — AIM', title: 'Strategy & Media Buying', body: 'Audience intelligence, channel strategy and negotiated airtime — placing every dirham where it earns attention, not just impressions.' },
      { label: '02 — AIR', title: 'Production', body: 'Broadcast-grade commercials from concept to final cut — scripted, filmed and edited by a team that understands what plays on-air.' },
      { label: '03 — AMPLIFY', title: 'Campaigns & Creative', body: 'Integrated rollout and advertisement design that extends a single spot into a full, multi-channel campaign presence.' },
    ],
  },
  {
    blockType: 'services',
    eyebrow: 'What we do',
    heading: 'Services',
    intro: 'A single point of accountability across strategy, screen and reach.',
    services: [
      { title: 'TV Media Buying', body: 'Airtime planning and negotiation across national and regional broadcast networks, built on real audience data.' },
      { title: 'TV Commercial Production', body: 'Full-scale production of TV commercials and branded content, from script to final broadcast master.' },
      { title: 'Media Campaigns', body: 'Integrated campaign strategy spanning broadcast, digital and out-of-home, engineered as one connected story.' },
      { title: 'Advertisement Design & Production', body: 'Creative design and production for brands, broadcasters and government institutions across the region.' },
    ],
  },
  {
    blockType: 'clients',
    eyebrow: 'Trusted by',
    heading: 'Clients & Partners',
    intro: 'Government entities, national brands and businesses across the UAE.',
    clients: [
      { name: 'Emirates News Agency', tag: 'WAM' },
      { name: 'National Media Authority', tag: 'Federal Media Body' },
      { name: 'General Civil Aviation Authority', tag: 'GCAA' },
      { name: 'Dubai Culture & Arts Authority', tag: 'Dubai Culture' },
      { name: 'MADO', tag: 'Turkish Restaurant' },
      { name: 'e&', tag: 'formerly Etisalat' },
      { name: 'Zee Network', tag: 'Media & Entertainment' },
      { name: 'GDRFA — Abu Dhabi', tag: 'Identity & Foreigners Affairs' },
      { name: 'Drake & Skull', tag: 'Engineering & Contracting' },
      { name: 'Dubai Municipality', tag: 'Government of Dubai' },
      { name: "Prime Minister's Office", tag: 'United Arab Emirates' },
    ],
    note: 'Some entity names shown reflect recent UAE government restructuring (2025–2026). Please confirm exact current names/logos before publishing live.',
  },
  {
    blockType: 'contact',
    eyebrow: 'Get in touch',
    heading: "Let's aim your next campaign.",
    body: "Tell us about your brand, your broadcast window, or the commercial you need produced — we'll take it from there.",
    email: 'hello@orionilam.com',
    details: [
      { text: 'Abu Dhabi, United Arab Emirates' },
      { text: '+971 [phone pending]' },
      { text: 'www.orionilam.com' },
    ],
  },
]
