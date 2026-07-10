# Orion Platform

Production rebuild of the Orion Media website: a fully editable ("WordPress-like")
public site plus an **agentic support chat** that answers from the client's own
documents and hands off to a human when it can't.

> The customer's original reference files live one level up in `../` (the
> hardcoded HTML design + their Vercel chat proxy). They are **reference only** —
> this folder is the real build and keeps our work separate from theirs.

## Architecture

One web app (Payload = admin panel **and** public site) + one chat service,
sharing one database. Fewer moving parts, cheaper to host.

```
              ┌──────────────── cms (Payload + Next.js) ─────────────────┐
Visitors ───► │  public site  (renders CMS content, reuses the HTML)     │
Admins ─────► │  /admin panel (client edits pages, blocks, brand, docs)  │
              └──────┬───────────────────────────────────┬──────────────┘
                     │ knowledge docs -> /ingest          │ chat widget -> /chat
                     ▼                                     ▼
              chat (FastAPI + LangChain) ──► Claude / Groq / OpenAI
                     │
                     └──────── Postgres + pgvector (shared with the CMS) ─┘
```

| Service | Folder | Stack | Role |
|---|---|---|---|
| Site + Admin | `cms/` | Payload + Next.js + Postgres | Public site **and** WordPress-like editor: pages, blocks, media, brand theme, knowledge docs, roles |
| Chat service | `chat/` | FastAPI + LangChain | Agentic RAG replies + human handoff |
| Database | (`db` in compose) | Postgres + pgvector | Shared: CMS content **and** chat embeddings |

> Why one app instead of a separate React frontend: the client edits content in
> the CMS, not in code — a standalone frontend would add a second app to build,
> deploy and keep alive for no gain. Payload ships Next.js, so the public site
> reuses the customer's existing HTML/CSS directly.

## Why LangChain (not a single vendor SDK)

`chat/app/providers.py` is the only file that names a concrete model class.
Everything else depends on LangChain's interfaces, so you switch between
**Claude (prod)**, **Groq (free testing)**, and **OpenAI** by changing
`CHAT_PROVIDER` in `chat/.env` — no code change. Embeddings default to a **free
local model** so you can exercise the whole RAG pipeline without paying per token.

## Current status

- [x] **Phase 0** — repo scaffold, docker-compose, env templates
- [x] **Phase 0** — chat service: provider-agnostic RAG + escalation (compiles, runnable)
- [x] **Phase 1** — public site rebuilt from the reference design, CMS-driven, responsive (demo-ready via seed content)
- [x] **Phase 2** — Payload CMS: Pages/blocks/Media/Users, Brand + Nav globals, KnowledgeDocs → chat ingest
- [x] **Phase 4** — seed script: site + admin open pre-populated on first boot
- [x] **Phase 3** — admin polish: dynamic `/[slug]` pages, live preview, SEO+OG wired, color-picker + brand-color → CSS injection, Media/sharp enabled
- [ ] **Phase 5** — escalation hardening (contact capture form in the widget) + prod rate limiting
- [ ] **Phase 6** — deploy to Render, HTTPS, locked CORS

### Production status / TODOs
- ✅ **DB schema:** migration files generated; `push` off in prod (runs `payload migrate` at boot).
- ✅ **Embeddings:** switched to hosted OpenAI (`text-embedding-3-small`, multilingual) — chat image is lean (no torch), fits small instances. Needs `OPENAI_API_KEY`.
- ✅ **Restart-safe seed:** Brand/Nav only seed on first boot (hidden `seeded` flag), so restarts never reset customer edits. Pages live in the persistent DB volume.
- ✅ **Prod stack:** `docker-compose.prod.yml` + Caddy (auto-HTTPS, one domain). See `VPS-DEPLOY.md`.
- ⚠️ **DB backups (do before real launch):** nightly `pg_dump` of the Postgres volume. If the disk dies with no backup, data is lost. Not yet automated.
- ⚠️ **Media/uploads storage:** images save to local `media/`. Persists on a VPS (real disk), but wiped on Render free (ephemeral). For heavy use → S3/Cloudflare R2 (`@payloadcms/storage-s3`).
- **Env:** set `NEXT_PUBLIC_SERVER_URL`, `DATABASE_URI`, `PAYLOAD_SECRET`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS` per host; lock CORS to the real domain.

## Run locally (test it yourself / record a demo — $0)

Everything runs on your machine. Nothing is public, nothing is billed.

**One-time prerequisites (you do these once):**
1. Install **Docker Desktop** → https://www.docker.com/products/docker-desktop
2. Two **free API tokens** (no credit card for either):
   - Groq (chat model) → https://console.groq.com
   - Hugging Face (embeddings) → https://huggingface.co/settings/tokens

The Payload admin boilerplate is already committed — no `create-payload-app`
step. (Both embeddings + chat are free-tier; embeddings for FAQ-scale docs cost
effectively nothing on any provider — see note below.)

**Then, every time you want to run it:**
```bash
# In chat/.env, paste:
#   GROQ_API_KEY   (replace PASTE_YOUR_FREE_GROQ_KEY_HERE)
#   HF_API_KEY     (replace PASTE_YOUR_FREE_HF_TOKEN_HERE)
# Then from this folder:
docker compose up --build
```

> **Why hosted embeddings?** They keep the chat image tiny (no ~2GB torch),
> so the build is fast/reliable and it fits free hosts later. Cost is
> negligible (~$0.02 per *million* tokens — a whole FAQ set embeds for a
> fraction of a cent). To run embeddings fully offline instead, set
> `EMBEDDINGS_PROVIDER=local` and build with `requirements-local.txt`.

Wait for it to build (first time is slow), then open:

| URL | What |
|---|---|
| http://localhost:3001 | The website (looks like the customer's design) |
| http://localhost:3001/admin | Admin panel — login `admin@orionilam.com` / `changeme123` |
| http://localhost:8000/health | Chat service health check |

The site and admin come up **already filled with content** (the seed script did
that). Edit anything in the admin, save, refresh the site — that's the
"WordPress-like" experience to show the customer.

**To demo the AI chat's knowledge:** in the admin, go to *Knowledge Docs* → add
a doc (e.g. paste your services/FAQ) → save. Now open the chat bubble on the
site and ask about it — it answers from your doc. Ask something you *didn't*
add, and it escalates to a human instead of guessing.

Stop everything with `Ctrl+C`, or `docker compose down` to also remove
containers (your data persists in the `db_data` volume).

## Showing the customer without deploying

Since it runs locally, you can:
- **Screen-share** (Zoom/Meet) and click through the live site + admin, or
- **Screen-record** a short walkthrough, or
- Run it on your laptop **in person**.

Deploy for real (Render/Railway, one platform, all 3 services) only after he
says yes — see Phase 6. Nothing about the code changes for deployment.
