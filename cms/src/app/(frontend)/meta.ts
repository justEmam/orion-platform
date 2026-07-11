/**
 * Build Next.js Metadata (the <title>, <meta description>, and Open Graph tags
 * that control Google results + link-share previews) from a page's SEO fields
 * in the CMS. One helper used by every route so all pages behave the same.
 */
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '../../payload.config'

const SITE_NAME = 'Orion Media'
const FALLBACK_TITLE = 'Orion Media | Aim. Air. Amplify.'
const FALLBACK_DESC =
  'Orion Media — TV media buying, commercial production, campaign strategy and advertisement design, based in Abu Dhabi, UAE.'
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export async function buildMetadata(slug: string): Promise<Metadata> {
  let seo: any = null
  let favicon: string | undefined
  try {
    const payload = await getPayload({ config })
    const [res, brand] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1, // resolve the shareImage upload so we get its URL
      }),
      payload.findGlobal({ slug: 'brand', depth: 1 }),
    ])
    seo = res.docs[0]?.seo || null
    // Editable favicon from the Brand global (an uploaded Media doc).
    if ((brand as any)?.favicon && typeof (brand as any).favicon === 'object') {
      favicon = `${baseURL}${(brand as any).favicon.url}`
    }
  } catch {
    // DB unreachable — fall back to sensible defaults below.
  }

  const title = seo?.title || FALLBACK_TITLE
  const description = seo?.description || FALLBACK_DESC

  // The share image can be a populated Media doc (depth:1) or just an id.
  const imgUrl =
    seo?.shareImage && typeof seo.shareImage === 'object' && seo.shareImage.url
      ? `${baseURL}${seo.shareImage.url}`
      : undefined

  return {
    title,
    description,
    // Editable favicon (from Brand). Falls back to Next/browser default if unset.
    ...(favicon ? { icons: { icon: favicon } } : {}),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      ...(imgUrl ? { images: [{ url: imgUrl }] } : {}),
    },
    twitter: {
      card: imgUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imgUrl ? { images: [imgUrl] } : {}),
    },
  }
}
