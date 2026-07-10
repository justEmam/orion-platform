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

  // Brand + Navigation globals.
  await payload.updateGlobal({ slug: 'brand', data: seedBrand as any })
  await payload.updateGlobal({ slug: 'navigation', data: seedNav as any })
  payload.logger.info('Seed: brand + navigation set')

  payload.logger.info('Seed complete.')
}

// Allow `npx payload run src/seed.ts`
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
