# Deploying Orion Platform to Render (free tier)

Gets the customer a live URL to try. Free tier is fine for a click-around demo —
just know the limits (below). Nothing here is Render-specific; the same Docker
setup runs on Railway, Fly, a VPS, etc.

## Free-tier reality (tell the customer)
- Services **sleep after ~15 min idle** → first visit wakes them (~50s). Normal.
- Free Postgres **expires after ~30 days** and is size-limited.
- The **chat service** ships a ~470MB ML model; free tier has 512MB RAM, so it's
  tight. If it OOMs, put `orion-chat` (and ideally the DB) on the cheapest paid
  tier — everything else can stay free.
- **Uploaded images reset on each deploy** (ephemeral disk). Fine for a demo;
  for real launch switch Media to S3/R2 (see README production TODOs).

---

## 1. Push the code to GitHub
```bash
cd orion-platform
git init && git add . && git commit -m "Orion platform"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/orion-platform.git
git push -u origin main
```
`.env` files are gitignored — your keys are NOT pushed. Good.

## 2. Create the Blueprint on Render
1. Render dashboard → **New → Blueprint**.
2. Connect the GitHub repo. Render reads `render.yaml` and shows 3 services +
   1 database (`orion-db`, `orion-chat`, `orion-cms`).
3. Click **Apply**. It provisions the DB and starts building the two images.
   (The chat image build is slow — it installs torch + pre-downloads the model.)

## 3. Enable pgvector on the database (one-time)
The chat stores embeddings via the `vector` extension. After `orion-db` is live:
- Render → `orion-db` → **Connect** → open the **PSQL command** / shell, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 4. Set the secrets + cross-service URLs
Some env vars are intentionally left blank in the blueprint (`sync: false`) so
keys stay out of git and so you can fill the real Render URLs. After the first
build, note each service's URL (e.g. `https://orion-cms.onrender.com`), then:

**orion-chat** → Environment:
- `GROQ_API_KEY` = your Groq key
- `ALLOWED_ORIGINS` = `https://orion-cms.onrender.com`  (the CMS URL)

**orion-cms** → Environment:
- `NEXT_PUBLIC_SERVER_URL` = `https://orion-cms.onrender.com`
- `NEXT_PUBLIC_CHAT_ENDPOINT` = `https://orion-chat.onrender.com/chat`
- `CHAT_INGEST_URL` = `https://orion-chat.onrender.com/ingest`

Save → Render redeploys the affected service.

## 5. First boot does the rest automatically
On `orion-cms` start, its entrypoint:
1. runs `payload migrate` (creates all tables — no interactive prompt), then
2. runs the seed (creates the published **Home** page if missing).
So the site comes up populated. No manual DB work beyond step 3.

## 6. Create your admin login
Visit `https://orion-cms.onrender.com/admin` → the first-user form → create your
owner account. (Then create an **editor** account for the customer.)

## 7. Test the live site
- `https://orion-cms.onrender.com` — the site (give this link to the customer)
- `https://orion-chat.onrender.com/health` → `{"status":"ok","provider":"groq"}`
- open the chat bubble and ask something → (until knowledge docs are added it
  will escalate most questions — that's expected)

That's the deploy done — the site is live.

---

## Ongoing use (the customer does this in the admin — NOT a deploy step)
The chat only knows what's in the **Knowledge Docs**. The customer (or you) adds
these anytime, in the admin, no redeploy:

- Admin → **Knowledge Docs** → **Create New** → paste Q&A content → **Save**.
- Each save auto-sends the text to the chat service's `/ingest`, embedding it so
  the assistant can answer from it immediately.
- Format = question / answer pairs (see `chat/SAMPLE-knowledge-doc.md` and the
  Arabic `chat/SAMPLE-knowledge-doc-ar.md` for the shape to share with them).

The customer edits pages, brand, navigation, and knowledge docs entirely from
the admin — deploying is a one-time thing, content is theirs to change anytime.

---

## Troubleshooting
- **Chat 502 / keeps restarting** → almost certainly RAM (the ML model). Bump
  `orion-chat` to the cheapest paid instance.
- **Chat can't reach DB** → confirm step 3 (pgvector) ran; the code auto-fixes
  the `postgres://` → `postgresql+psycopg://` prefix, so the raw Render URL is OK.
- **Chat replies work but knowledge is empty** → re-save your Knowledge Docs so
  they re-`/ingest` after the chat service is fully up.
- **CORS error in the browser console** → `ALLOWED_ORIGINS` on orion-chat must
  exactly match the CMS URL (https, no trailing slash).
- **Uploaded images vanished** → expected on free tier (ephemeral disk); see
  README production TODOs for cloud storage.
