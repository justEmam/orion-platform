# Deploying Orion Platform to a VPS (any provider)

This is the **production** deploy: your own server, your domain, real HTTPS.
Works identically on Hetzner, DigitalOcean, Linode, AWS Lightsail, etc. — a VPS
is just "a Linux box with Docker", and the whole app is Docker Compose.

The same setup was **built and tested locally first** (see the `.prod` files), so
these steps are proven — nothing here is guesswork.

## What you need
- A VPS with **≥2GB RAM** (the Next.js production build needs it), Ubuntu/Debian.
- A **domain** you control.
- ~30–45 min the first time.

---

## 1. Point your domain at the VPS
In your registrar's DNS settings, add **two A records**:
```
Type: A    Name: @      Value: <your-vps-ip>     ← yourdomain.com
Type: A    Name: www    Value: <your-vps-ip>     ← www.yourdomain.com
```
The `www` record matters: without it, visitors typing `www.yourdomain.com` get
nothing. (Caddy redirects www → the main domain automatically once DNS exists.)
DNS can take a few minutes to propagate.

## 2. SSH into the VPS
```bash
ssh root@<your-vps-ip>
```

## 3. Install Docker + Compose (one time)
```bash
curl -fsSL https://get.docker.com | sh
```

## 4. Get the code
```bash
git clone https://github.com/justEmam/orion-platform.git
cd orion-platform
```

## 5. Create the production env files
Copy each template and fill in real values (with `nano`):
```bash
cp caddy.env.example        caddy.env
cp db.env.example           db.env
cp cms/.env.prod.example    cms/.env.prod
cp chat/.env.prod.example   chat/.env.prod
```
The must-change values:

| File | Set |
|---|---|
| `caddy.env` | `SITE_DOMAIN=yourdomain.com` (no https://) and `WWW_DOMAIN=www.yourdomain.com` |
| `db.env` | `POSTGRES_PASSWORD=<a strong password>` |
| `cms/.env.prod` | same DB password in `DATABASE_URI`; a long random `PAYLOAD_SECRET`; your domain in `NEXT_PUBLIC_SERVER_URL` + `NEXT_PUBLIC_CHAT_ENDPOINT` (`https://yourdomain.com/chat-api/chat`); your `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (your admin login) |
| `chat/.env.prod` | same DB password in `DATABASE_URL`; the LLM key (`GROQ_API_KEY` to start, or the customer's `OPENAI_API_KEY` with `CHAT_PROVIDER=openai`); `ALLOWED_ORIGINS=https://yourdomain.com` |

> Use the SAME strong DB password in `db.env`, `cms/.env.prod`, and
> `chat/.env.prod` — all three must match.

## 6. Export the build-time browser URLs (first build only)
`NEXT_PUBLIC_*` values are baked into the browser bundle **at build time**:
```bash
export SITE_DOMAIN=yourdomain.com
export NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
export NEXT_PUBLIC_CHAT_ENDPOINT=https://yourdomain.com/chat-api/chat
```
(Only needed when building — reboots/restarts reuse the built image.)

## 7. Launch everything
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
First build takes several minutes. On startup the CMS auto-runs migrations +
seeds the Home page + creates your admin user, and Caddy fetches a free HTTPS
certificate for both `yourdomain.com` and `www.yourdomain.com`.

Watch it come up:
```bash
docker compose -f docker-compose.prod.yml logs -f cms
```
Wait for the migrations, `[seed] complete`, and `Ready`.

## 8. Done — visit your site
- `https://yourdomain.com` — live site, Home page already seeded
- `https://www.yourdomain.com` — redirects to the above
- `https://yourdomain.com/admin` — log in with your `SEED_ADMIN_EMAIL` /
  `SEED_ADMIN_PASSWORD` (change the password in the admin afterwards)
- `https://yourdomain.com/chat-api/health` — chat service health

The customer edits pages, brand, navigation, chat widget, and Knowledge Docs
entirely from `/admin`. Content changes never need a redeploy.

## 9. Turn on nightly backups (do this — it's 1 minute)
```bash
chmod +x backup.sh restore.sh
./backup.sh                  # run once now to confirm it works
crontab -e                   # then add this line:
```
```
0 3 * * * cd /root/orion-platform && ./backup.sh >> backups/backup.log 2>&1
```
That dumps the database + uploaded media to `./backups/` every night at 03:00,
keeping the last 14.

> **Off-site copies:** `./backups` is on the same disk as the server — it does
> NOT survive disk failure or the VPS being deleted (e.g. unpaid bill).
> Periodically copy backups off the server: from your own PC run
> `scp root@<vps-ip>:orion-platform/backups/db-*.sql.gz .`
> or sync to a free bucket with rclone (Cloudflare R2 free tier).

**To restore** (replaces current data!):
```bash
./restore.sh backups/db-YYYY-MM-DD_HHMM.sql.gz
```

---

## Surviving restarts — automatic
Every service has `restart: unless-stopped`, so if a container crashes or the
**VPS reboots**, Docker brings everything back up by itself. Data lives in
named volumes (`db_data` for the database, `cms_media` for uploads) — rebuilds
and reboots never touch it. Only `docker compose down -v` deletes volumes;
never run that in production.

## Updating the site later (after code changes)
```bash
cd orion-platform
git pull
export SITE_DOMAIN=... NEXT_PUBLIC_SERVER_URL=... NEXT_PUBLIC_CHAT_ENDPOINT=...  # same as step 6
docker compose -f docker-compose.prod.yml up -d --build
```

## Switching the chat to the customer's OpenAI key
Edit `chat/.env.prod`:
```
CHAT_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```
then `docker compose -f docker-compose.prod.yml up -d chat`. (Anthropic works
the same way — see `chat/.env.prod.example`.)

## Handy commands
```bash
docker compose -f docker-compose.prod.yml ps          # status
docker compose -f docker-compose.prod.yml restart chat
docker compose -f docker-compose.prod.yml logs -f cms
docker compose -f docker-compose.prod.yml down        # stop (data persists)
```

## Troubleshooting
- **HTTPS cert not issued** → DNS must point at the VPS first (step 1) and
  ports 80/443 must be open in the VPS firewall. Caddy retries automatically.
- **CMS build fails / OOM during build** → the VPS needs ≥2GB RAM.
- **Chat can't reach DB** → the DB password must match across the 3 env files.
- **Chat escalates everything** → add Knowledge Docs in `/admin` (they sync to
  the chat automatically on save).
- **Chat gives canned English fallback replies** → the browser can't reach the
  chat API; check `NEXT_PUBLIC_CHAT_ENDPOINT` was exported during the build
  (step 6) and rebuild if not.
