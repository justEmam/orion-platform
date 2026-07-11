# Deploying Orion Platform to a VPS (any provider)

This is the **production** deploy: your own server, your domain, real HTTPS.
Works identically on Hetzner, DigitalOcean, Linode, AWS Lightsail, etc. — a VPS
is just "a Linux box with Docker", and the whole app is Docker Compose.

The same setup was **built and tested locally first** (see the `.prod` files), so
these steps are proven — nothing here is guesswork.

## What you need
- A VPS with **≥2GB RAM** (the chat's ML model needs headroom), Ubuntu/Debian.
- A **domain** you control (to point at the VPS).
- ~30–45 min the first time.

---

## 1. Point your domain at the VPS
In your domain registrar's DNS settings, add an **A record**:
```
Type: A    Name: @    Value: <your-vps-ip>
```
(Optional `www`: add another A record `Name: www` → same IP.)
DNS can take a few minutes to propagate.

## 2. SSH into the VPS
```bash
ssh root@<your-vps-ip>
```

## 3. Install Docker + Compose (one time)
```bash
curl -fsSL https://get.docker.com | sh
```
(That script installs Docker Engine + the Compose plugin.)

## 4. Get the code
```bash
git clone https://github.com/justEmam/orion-platform.git
cd orion-platform
```

## 5. Create the production env files
Copy each template and fill in real values (a text editor like `nano`):
```bash
cp caddy.env.example        caddy.env
cp db.env.example           db.env
cp cms/.env.prod.example    cms/.env.prod
cp chat/.env.prod.example   chat/.env.prod
```
Then edit them. The must-change values:

| File | Set |
|---|---|
| `caddy.env` | `SITE_DOMAIN=yourdomain.com` (your real domain, no https://) |
| `db.env` | `POSTGRES_PASSWORD=<a strong password>` |
| `cms/.env.prod` | same DB password in `DATABASE_URI`; a long random `PAYLOAD_SECRET`; your real domain in `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_CHAT_ENDPOINT` (`https://yourdomain.com/chat-api/chat`) |
| `chat/.env.prod` | same DB password in `DATABASE_URL`; your `OPENAI_API_KEY` (powers both chat + embeddings); `ALLOWED_ORIGINS=https://yourdomain.com` |

> Tip: use the SAME strong DB password in `db.env`, `cms/.env.prod`, and
> `chat/.env.prod` — all three must match.

## 6. Enable pgvector (one time, after the DB is up once)
Start just the DB, enable the extension, then continue:
```bash
docker compose -f docker-compose.prod.yml up -d db
docker compose -f docker-compose.prod.yml exec db psql -U orion -d orion -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## 7. Launch everything
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
First run is slow — it builds the chat image (torch + the embedding model) and
the CMS. On startup the CMS auto-runs migrations + seeds the Home page, and
Caddy fetches a free HTTPS certificate for your domain.

Watch it come up:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

## 8. Done — visit your site
- `https://yourdomain.com` — the live site (HTTPS, valid cert), Home page
  already seeded automatically
- `https://yourdomain.com/admin` — log in with the `SEED_ADMIN_EMAIL` /
  `SEED_ADMIN_PASSWORD` you set in `cms/.env.prod` (auto-created on first boot;
  change the password in the admin afterwards)
- `https://yourdomain.com/chat-api/health` — chat service health

The customer edits pages, brand, navigation, and Knowledge Docs entirely from
`/admin`. Content changes never need a redeploy.

---

## Updating the site later (after code changes)
```bash
cd orion-platform
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Handy commands
```bash
# see status
docker compose -f docker-compose.prod.yml ps
# restart one service
docker compose -f docker-compose.prod.yml restart chat
# stop everything (data persists in volumes)
docker compose -f docker-compose.prod.yml down
```

## Troubleshooting
- **HTTPS cert not issued** → DNS must point at the VPS first (step 1), and
  ports 80/443 must be open in the VPS firewall. Caddy retries automatically.
- **Chat restarts / OOM** → needs more RAM; use a ≥2GB VPS.
- **Chat can't reach DB** → the DB password must match across the 3 env files.
- **Chat replies but knows nothing** → add Knowledge Docs in `/admin` (they
  auto-embed on save).
- **Uploaded images persist** here (unlike Render free) because the VPS disk is
  persistent — but they live in the container's `media/`. For extra safety, back
  up or mount a volume for it before heavy use.
```
```
