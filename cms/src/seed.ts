/**
 * Seed CONTENT — populates the Home page + Brand + Navigation with the starter
 * design, so the client opens the admin to a fully-filled, editable Home page
 * (not blank forms). Admin USERS are created via the /admin "first user" form,
 * not here, so this never conflicts with your login.
 *
 * Idempotent: re-running won't duplicate the Home page. Tables must already
 * exist (they're created the first time you run `npm run dev`).
 *
 * Run with:  npm run seed
 */
import { getPayload } from 'payload'
import config from './payload.config'
import { seedLayout, seedBrand, seedNav } from './app/(frontend)/seed'

export const seed = async () => {
  const payload = await getPayload({ config })

  // Home page — only if it doesn't exist yet (idempotent).
  const existingHome = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  if (existingHome.totalDocs === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        layout: seedLayout as any,
        _status: 'published',
      } as any,
    })
    payload.logger.info('Seed: created published "home" page')
  } else {
    payload.logger.info('Seed: "home" page already exists — left untouched')
  }

  // Brand + Navigation globals — seed ONLY on first run. On later restarts we
  // must NOT overwrite them, or the customer's logo/colors/nav edits would be
  // reset every time the server restarts. We detect "already configured" by a
  // hidden `seeded` flag we set the first time.
  const brand = await payload.findGlobal({ slug: 'brand' })
  if (!(brand as any)?.seeded) {
    await payload.updateGlobal({
      slug: 'brand',
      data: { ...seedBrand, seeded: true } as any,
    })
    payload.logger.info('Seed: brand set (first run)')
  } else {
    payload.logger.info('Seed: brand already configured — left untouched')
  }

  const nav = await payload.findGlobal({ slug: 'navigation' })
  if (!(nav as any)?.seeded) {
    await payload.updateGlobal({
      slug: 'navigation',
      data: { ...seedNav, seeded: true } as any,
    })
    payload.logger.info('Seed: navigation set (first run)')
  } else {
    payload.logger.info('Seed: navigation already configured — left untouched')
  }

  payload.logger.info('Seed complete.')
}

// Allow `npx payload run src/seed.ts`
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
