#!/bin/sh
# ============================================================
# Restore a database backup made by backup.sh.
#
#   ./restore.sh backups/db-2026-07-12_0300.sql.gz
#
# WARNING: this REPLACES the current database with the backup's contents.
# (To also restore uploaded media:
#   docker compose -f docker-compose.prod.yml exec -T cms tar -C /app -xzf - < backups/media-<stamp>.tar.gz )
# ============================================================
set -e
cd "$(dirname "$0")"

FILE="$1"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "usage: ./restore.sh backups/db-YYYY-MM-DD_HHMM.sql.gz"
  exit 1
fi

. ./db.env

echo "Stopping app containers (they hold DB connections)..."
docker compose -f docker-compose.prod.yml stop cms chat

echo "Recreating database '$POSTGRES_DB'..."
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;"

echo "Restoring $FILE ..."
gunzip -c "$FILE" | docker compose -f docker-compose.prod.yml exec -T db \
  psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "Starting app containers..."
docker compose -f docker-compose.prod.yml start cms chat

echo "Restore complete. Verify the site + admin look right."
