#!/bin/sh
# On container start (production):
#   1. Apply DB migrations non-interactively (creates/updates tables safely).
#   2. Seed starter content (idempotent — only creates the Home page if absent).
#   3. Launch the app.
# This replaces the dev-only interactive "push", so it runs unattended on Render.
set -e

echo "[entrypoint] Running database migrations…"
npx payload migrate || {
  echo "[entrypoint] migrate failed"; exit 1;
}

echo "[entrypoint] Seeding starter content (idempotent)…"
npx payload run src/seed.ts || echo "[entrypoint] seed skipped/failed (non-fatal)"

echo "[entrypoint] Starting Next.js…"
exec npm run start
