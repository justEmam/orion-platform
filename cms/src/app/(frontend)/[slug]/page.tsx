/**
 * Dynamic page route — /about, /contact, or ANY slug the client creates in the
 * admin. This is what makes the site self-service: the client clicks
 * "Create Page", gives it a slug, and it's instantly live here. No developer.
 *
 * `generateStaticParams` pre-lists existing published pages; new ones still
 * render on demand (dynamicParams defaults to true).
 */
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { renderPage } from '../renderPage'
import { buildMetadata } from '../meta'

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return buildMetadata(slug)
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const pages = await payload.find({
      collection: 'pages',
      where: { slug: { not_equals: 'home' } },
      limit: 100,
      depth: 0,
    })
    return pages.docs.map((p: any) => ({ slug: p.slug }))
  } catch {
    return []
  }
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
