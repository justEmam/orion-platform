/**
 * Seed the Home page via the running dev server's REST API (works around the
 * Windows `payload run` hang). Reads the same seed content the site falls back
 * to, logs in, and creates/updates the "home" page + Brand + Navigation.
 *
 * Usage:  node seed-via-api.mjs <email> <password>   (server must be running)
 */
const BASE = process.env.CMS_URL || 'http://localhost:3001'
const [, , email, password] = process.argv

if (!email || !password) {
  console.error('Usage: node seed-via-api.mjs <email> <password>')
  process.exit(1)
}

// Import the shared seed content (tsx not needed — it's plain data, but the
// file is .ts; we re-declare here to avoid a TS loader). Keep in sync with
// src/app/(frontend)/seed.ts.
const { seedLayout, seedBrand, seedNav } = await import('./src/app/(frontend)/seed.ts')

async function main() {
  // 1. Login
  const loginRes = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const login = await loginRes.json()
  if (!login.token) {
    console.error('Login failed:', JSON.stringify(login))
    process.exit(1)
  }
  const auth = { Authorization: `JWT ${login.token}`, 'Content-Type': 'application/json' }
  console.log('Logged in OK.')

  // 2. Home page — create if missing, else update its layout.
  const existing = await (
    await fetch(`${BASE}/api/pages?where[slug][equals]=home&limit=1`, { headers: auth })
  ).json()

  const pageBody = { title: 'Home', slug: 'home', layout: seedLayout, _status: 'published' }

  if (existing.docs?.length) {
    const id = existing.docs[0].id
    const r = await fetch(`${BASE}/api/pages/${id}`, {
      method: 'PATCH', headers: auth, body: JSON.stringify(pageBody),
    })
    console.log('Updated existing Home page:', r.status)
  } else {
    const r = await fetch(`${BASE}/api/pages`, {
      method: 'POST', headers: auth, body: JSON.stringify(pageBody),
    })
    const j = await r.json()
    console.log('Created Home page:', r.status, j.doc ? `id=${j.doc.id}` : JSON.stringify(j).slice(0, 300))
  }

  // 3. Brand + Navigation globals.
  const b = await fetch(`${BASE}/api/globals/brand`, {
    method: 'POST', headers: auth, body: JSON.stringify(seedBrand),
  })
  console.log('Brand:', b.status)
  const n = await fetch(`${BASE}/api/globals/navigation`, {
    method: 'POST', headers: auth, body: JSON.stringify(seedNav),
  })
  console.log('Navigation:', n.status)

  console.log('Seed via API complete.')
}

main().catch((e) => { console.error(e); process.exit(1) })
