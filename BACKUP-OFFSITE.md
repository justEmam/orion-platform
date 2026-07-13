# Off-site backups → Cloudflare R2 (free, automatic)

Your nightly `backup.sh` dumps the DB + media to `./backups/` on the VPS. That
protects against mistakes, but NOT against the disk dying or the VPS being
deleted. This adds an **automatic off-site copy** to a free Cloudflare R2 bucket
— so a total VPS loss still leaves your data safe.

One-time setup (~10 min). After this, every nightly backup auto-uploads.

---

## 1. Create the R2 bucket (Cloudflare, free)
1. Sign up / log in at https://dash.cloudflare.com
2. Left sidebar → **R2** → (may ask you to enable it — it's free, no card for the
   free tier; if it asks for a card for verification, you still won't be charged
   under 10 GB).
3. **Create bucket** → name it `orion-backups` → Create.

## 2. Create R2 API credentials
1. In R2 → **Manage R2 API Tokens** (top right) → **Create API token**
2. Permissions: **Object Read & Write**, scope to the `orion-backups` bucket.
3. Create → **copy these three values** (shown once):
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint** (looks like `https://<accountid>.r2.cloudflarestorage.com`)

## 3. Install rclone on the VPS
```bash
curl https://rclone.org/install.sh | sudo bash
```

## 4. Configure the `r2` remote (non-interactive — paste your values)
Replace the 3 placeholders with your values from step 2:
```bash
rclone config create r2 s3 \
  provider=Cloudflare \
  access_key_id=YOUR_ACCESS_KEY_ID \
  secret_access_key=YOUR_SECRET_ACCESS_KEY \
  endpoint=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com \
  acl=private
```

## 5. Test it
```bash
cd ~/orion-platform
rclone listremotes            # should show "r2:"
./backup.sh                   # runs a backup + uploads
rclone ls r2:orion-backups    # should list your db-*.sql.gz files
```
If `rclone ls` shows your backup files — off-site is working. From now on the
nightly cron uploads automatically (backup.sh handles it — no extra cron line).

---

## How it behaves
- `backup.sh` uploads only if rclone + the `r2:` remote exist. If not configured,
  it silently skips (local backup still runs) — so nothing ever breaks over it.
- It uses `rclone sync`, so the bucket mirrors your local `backups/` (last 14).
- Bucket name default is `orion-backups`; override with `RCLONE_REMOTE` env var.

## Restoring from R2 (if the VPS is gone)
On a fresh VPS after you've re-cloned the repo + set up rclone:
```bash
rclone copy r2:orion-backups backups/     # pull backups down
./restore.sh backups/db-YYYY-MM-DD_HHMM.sql.gz
```

## Cost
Your backups are tiny (KBs). R2 free tier is 10 GB storage + no egress fees —
you'll use a fraction of a percent. Effectively free, permanently.
