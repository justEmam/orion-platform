/**
 * Headless seed via the REST API of the ALREADY-RUNNING server.
 *
 * Why not getPayload() in a standalone script? It hangs on init in the
 * production container. Talking to the running HTTP server is reliable.
 *
 * Flow (idempotent):
 *   1. Wait for the server to answer.
 *   2. Ensure a first admin exists — create one from SEED_ADMIN_EMAIL/PASSWORD
 *      if the users collection is empty (Payload allows the FIRST user with no
 *      auth). Then log in.
 *   3. Create the Home page + Brand + Navigation if missing.
 *
 * Run by docker-entrypoint.sh after Next.js starts.
 */
import { seedLayout, seedBrand, seedNav } from './app/(frontend)/seed.ts'

const BASE = process.env.SEED_BASE_URL || 'http://localhost:3001'
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@orion.local'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'changeme-please-1234'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${BASE}/api/access`)
      if (r.ok || r.status === 403) return true
    } catch {}
    await sleep(2000)
  }
  throw new Error('server never became ready')
}

async function ensureAdminAndLogin() {
  // Is there already a user? (first-user creation is only allowed when none.)
  const first = await fetch(`${BASE}/api/users/first-register`).catch(() => null)
  // Try to create the first admin (succeeds only if users is empty).
  await fetch(`${BASE}/api/users/first-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: 'Admin',
      role: 'admin',
    }),
  }).catch(() => {})

  // Log in (works whether we just created it or it already existed).
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = await res.json().catch(() => ({}))
  return data.token || null
}

async function main() {
  await waitForServer()
  const token = await ensureAdminAndLogin()
  if (!token) {
    console.log('[seed] no admin token (an admin may already exist with a different password) — skipping content seed')
    return
  }
  const auth = { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }

  const existing = await (
    await fetch(`${BASE}/api/pages?where[slug][equals]=home&limit=1`, { headers: auth })
  ).json()

  if (existing.docs?.length) {
    console.log('[seed] Home page already exists — untouched')
  } else {
    const r = await fetch(`${BASE}/api/pages`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ title: 'Home', slug: 'home', layout: seedLayout, _status: 'published' }),
    })
    console.log('[seed] Home page created:', r.status)
  }

  // Brand + Nav only on first run (respect the "seeded" flag).
  const brand = await (await fetch(`${BASE}/api/globals/brand`, { headers: auth })).json()
  if (!brand?.seeded) {
    await fetch(`${BASE}/api/globals/brand`, {
      method: 'POST', headers: auth, body: JSON.stringify({ ...seedBrand, seeded: true }),
    })
    console.log('[seed] Brand set (first run)')
  }
  const nav = await (await fetch(`${BASE}/api/globals/navigation`, { headers: auth })).json()
  if (!nav?.seeded) {
    await fetch(`${BASE}/api/globals/navigation`, {
      method: 'POST', headers: auth, body: JSON.stringify({ ...seedNav, seeded: true }),
    })
    console.log('[seed] Navigation set (first run)')
  }
  console.log('[seed] complete.')
}

main().catch((e) => { console.error('[seed] failed:', e.message) })
