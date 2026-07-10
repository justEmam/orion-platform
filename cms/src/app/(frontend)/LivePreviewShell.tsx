'use client'
/**
 * Full live-preview shell used ONLY inside Payload's admin preview pane. It
 * listens for edits to whichever document the client is editing — the Page,
 * the Brand global, OR the Navigation global — and re-renders the relevant
 * part live, as you click/type, without saving.
 *
 * Payload's postMessage sends the doc being edited. We keep the last-known
 * values for each and merge live updates in. `data` from useLivePreview is the
 * in-progress doc for the currently-open editor; we detect which one it is by
 * the fields present (colors -> brand, links -> nav, layout -> page).
 */
import React from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import { RenderBlocks } from './blocks'
import { BrandStyle } from './BrandStyle'
import { Background, Header, Footer } from './SiteChrome'
import ChatWidget from './ChatWidget'

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

type Brand = {
  logoText?: string
  ctaLabel?: string
  ctaHref?: string
  colors?: Record<string, string>
}
type Nav = { links?: any[]; social?: any[]; copyright?: string }

export default function LivePreviewShell({
  initialLayout,
  initialBrand,
  initialNav,
}: {
  initialLayout: any[]
  initialBrand: Brand
  initialNav: Nav
}) {
  // One listener; the admin posts whichever doc is being edited. We merge any
  // recognized fields onto the current state so editing brand OR nav OR the
  // page all update live.
  const { data } = useLivePreview<any>({
    initialData: {},
    serverURL: baseURL,
    depth: 2,
  })

  const layout = Array.isArray(data?.layout) ? data.layout : initialLayout
  const brand: Brand = data?.colors || data?.logoText ? { ...initialBrand, ...data } : initialBrand
  const nav: Nav =
    data?.links || data?.social || data?.copyright ? { ...initialNav, ...data } : initialNav

  return (
    <>
      <BrandStyle colors={brand.colors} />
      <Background />
      <Header
        logo={brand.logoText || ''}
        links={nav.links || []}
        cta={{ label: brand.ctaLabel || '', href: brand.ctaHref || '#' }}
      />
      <main>
        <RenderBlocks layout={layout} />
      </main>
      <Footer logo={brand.logoText || ''} social={nav.social || []} copyright={nav.copyright || ''} />
      <ChatWidget />
    </>
  )
}
