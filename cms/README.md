# cms/ — Payload CMS **and** the public Orion Media site (one Next.js app)

This single app is both the **WordPress-like admin panel** (where the client
edits everything) and the **public website** (which renders that content).
One deploy, one thing to host.

## What's here (hand-written — the actual build)

```
src/
  payload.config.ts          Wires collections + globals + Postgres
  collections/
    Pages.ts                 The page builder (ordered "layout" of blocks)
    Media.ts                 Image/logo library
    KnowledgeDocs.ts         Docs the AI answers from -> pushes to chat /ingest
    Users.ts                 Admin/editor logins + roles
  globals/
    Brand.ts                 Logo, CTA, theme COLORS (maps to CSS variables)
    Navigation.ts            Header/footer links, social, copyright
  blocks/index.ts            Editable section types (Hero, Marquee, About,
                             Pillars, Services, Clients, Contact)
  app/(frontend)/
    page.tsx                 Home: fetch from Payload -> render blocks
    layout.tsx               Fonts + metadata
    blocks.tsx               One React component per block (reference markup)
    SiteChrome.tsx           Header, mobile nav, starfield bg, footer
    ChatWidget.tsx           Support chat UI -> FastAPI /chat (+ scripted fallback)
    seed.ts                  Reference design's copy as demo/fallback content
    theme.css                The reference design's CSS, verbatim (responsive)
```

## Setup — no `create-payload-app` needed

The Payload admin boilerplate (`src/app/(payload)/**`) is already committed, and
`package.json` is pinned to versions that install cleanly
(Payload 3.85.2 + Next 15.4.11 — do NOT run `create-payload-app`, its
auto-upgrade pulls an incompatible Next and fails with ERESOLVE).

Just:

```bash
cd cms
npm install      # resolves cleanly; verified with `npm run build`
```

## Run it

```bash
cp .env.example .env      # set PAYLOAD_SECRET; DATABASE_URI points at the shared db
docker compose up         # from repo root: db + chat + cms
```

- Public site:  http://localhost:3001
- Admin panel:  http://localhost:3001/admin  (first visit creates the admin user)

Until you create + publish a "home" page in the admin, the site renders the
**seed demo content** (identical to the customer's reference design), so the
demo looks finished immediately.
