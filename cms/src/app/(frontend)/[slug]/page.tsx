/**
 * Dynamic page route — /about, /contact, or ANY slug the client creates in the
 * admin. This is what makes the site self-service: the client clicks
 * "Create Page", gives it a slug, and it's instantly live here. No developer.
 *
 * Rendered per-request (reads the DB at request time). We deliberately do NOT
 * pre-build pages at build time — the DB isn't available then, which caused
 * DYNAMIC_SERVER_USAGE build errors. force-dynamic makes every page render on
 * demand, which is exactly what a CMS-driven, editable-anytime site wants.
 */
import { renderPage } from '../renderPage'
import { buildMetadata } from '../meta'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return buildMetadata(slug)
}

export default async function DynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { slug } = await params
  const { preview } = await searchParams
  return renderPage(slug, preview === 'true')
}
