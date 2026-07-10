#!/bin/sh
# On container start (production):
#   1. Apply DB migrations (non-interactive, safe).
#   2. Start Next.js.
#   3. Seed content via the running server's API (reliable — a standalone
#      getPayload() hangs in the container, so we talk to the live HTTP server).
set -e

echo "[entrypoint] Running database migrations…"
npx payload migrate || { echo "[entrypoint] migrate failed"; exit 1; }

echo "[entrypoint] Starting Next.js…"
npm run start &
APP_PID=$!

echo "[entrypoint] Seeding content via API (idempotent)…"
SEED_BASE_URL="http://localhost:3001" npx tsx src/seed-api.mjs || \
  echo "[entrypoint] seed skipped/failed (non-fatal)"

# Keep the container alive on the Next.js process.
wait $APP_PID
