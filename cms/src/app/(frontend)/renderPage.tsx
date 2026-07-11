/**
 * Shared page renderer. Used by BOTH the home route (/) and the dynamic
 * [slug] route (/about, /contact, …) so every page — whether it's the home
 * page or one the client creates later — renders identically from CMS data.
 *
 * Look up flow:
 *   1. Fetch the Page whose slug matches, plus the Brand + Navigation globals.
 *   2. If found, render its blocks. If not, Next.js shows the 404 page.
 *   3. The home slug ("home") also falls back to seed content so the very
 *      first boot (empty DB) still shows the finished design.
 */
import React from 'react'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '../../payload.config'
import { RenderBlocks } from './blocks'
import { Background, Header, Footer } from './SiteChrome'
import ChatWidget from './ChatWidget'
import { RefreshOnSave } from './RefreshOnSave'
import { BrandStyle } from './BrandStyle'
import { seedLayout, seedBrand, seedNav } from './seed'
import './theme.css'

export async function renderPage(slug: string, preview = false) {
  let page: any = null // full page doc (needed by live preview)
  let brand: any = seedBrand
  let nav: any = seedNav
  let chat: any = {}

  try {
    const payload = await getPayload({ config })
    const [pages, brandG, navG, chatG] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        limit: 1,
        // depth must match the useLivePreview hook (2) or live updates silently
        // fail to apply.
        depth: 2,
        // In preview, include unpublished drafts so the client sees edits
        // before they hit Publish.
        draft: preview,
      }),
      payload.findGlobal({ slug: 'brand', depth: 2, draft: preview }),
      payload.findGlobal({ slug: 'navigation', depth: 2, draft: preview }),
      payload.findGlobal({ slug: 'chat', depth: 2, draft: preview }),
    ])
    if (pages.docs[0]) page = pages.docs[0]
    if (brandG) brand = { ...seedBrand, ...(brandG as any) }
    if (navG) nav = { ...seedNav, ...(navG as any) }
    if (chatG) chat = chatG
  } catch {
    // DB unreachable — only the home page has a safe seed fallback.
  }

  let layout: any[] | null = page?.layout?.length ? page.layout : null

  // No page in the CMS for this slug. Home falls back to the seed design so the
  // site is never blank on first boot; any other slug is a genuine 404.
  if (!layout) {
    if (slug === 'home') layout = seedLayout
    else notFound()
  }

  // Same render for public AND preview. In preview mode we add RefreshOnSave,
  // which reliably refreshes the preview pane when the client hits Save — the
  // stable, WordPress-like behavior (no fragile as-you-type re-fetching).
  return (
    <>
      {preview && <RefreshOnSave />}
      <BrandStyle colors={brand.colors} />
      <Background />
      <Header
        logo={brand.logoText}
        links={nav.links}
        cta={{ label: brand.ctaLabel, href: brand.ctaHref }}
      />
      <main>
        <RenderBlocks layout={layout} />
      </main>
      <Footer logo={brand.logoText} social={nav.social} copyright={nav.copyright} />
      <ChatWidget settings={chat} />
    </>
  )
}
