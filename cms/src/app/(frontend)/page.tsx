/** Home page (/) — renders the CMS page with slug "home". */
import { renderPage } from './renderPage'
import { buildMetadata } from './meta'

// Rendered per-request (reads the DB at request time), not pre-built at
// build time — otherwise the production build errors with DYNAMIC_SERVER_USAGE.
export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata('home')
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  const { preview } = await searchParams
  return renderPage('home', preview === 'true')
}
