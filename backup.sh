#!/bin/sh
# ============================================================
# Nightly backup: database dump + uploaded media, timestamped,
# keeping the last 14 of each. Run from the project root.
#
# Manual run:   ./backup.sh
# Nightly cron: crontab -e   then add:
#   0 3 * * * cd /root/orion-platform && ./backup.sh >> backups/backup.log 2>&1
#
# IMPORTANT — OFF-SITE: backups in ./backups live on the SAME disk as the
# server. They protect against mistakes (bad edit, accidental delete) but NOT
# against disk failure or the VPS being deleted. Regularly copy them off the
# server — either download them (scp) or sync to a free bucket, e.g.:
#   rclone copy backups/ r2:orion-backups   (Cloudflare R2 free tier)
# ============================================================
set -e
cd "$(dirname "$0")"

# DB credentials from db.env (POSTGRES_USER / POSTGRES_DB)
. ./db.env

STAMP=$(date +%F_%H%M)
mkdir -p backups

# 1. Database — everything: pages, escalations, knowledge docs, users, chat FAQ.
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "backups/db-$STAMP.sql.gz"

# 2. Uploaded media (favicon, share images, media library).
docker compose -f docker-compose.prod.yml exec -T cms \
  tar -C /app -czf - media > "backups/media-$STAMP.tar.gz" 2>/dev/null || \
  echo "(no media dir yet — skipped media backup)"

# 3. Retention: keep the newest 14 of each locally, delete older.
ls -1t backups/db-*.sql.gz    2>/dev/null | tail -n +15 | xargs -r rm --
ls -1t backups/media-*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm --

# 4. OFF-SITE upload (optional). If rclone is installed AND a remote named
#    "r2" exists (see BACKUP-OFFSITE.md), sync the backups folder to the bucket.
#    Skipped silently if not configured — so the backup never fails over this.
RCLONE_REMOTE="${RCLONE_REMOTE:-r2:orion-backups}"
if command -v rclone >/dev/null 2>&1 && rclone listremotes 2>/dev/null | grep -q '^r2:'; then
  if rclone sync backups/ "$RCLONE_REMOTE" --quiet; then
    echo "$(date '+%F %T') off-site sync OK -> $RCLONE_REMOTE"
  else
    echo "$(date '+%F %T') WARNING: off-site sync FAILED (local backup is fine)"
  fi
fi

echo "$(date '+%F %T') backup OK: db-$STAMP.sql.gz ($(du -h "backups/db-$STAMP.sql.gz" | cut -f1))"
