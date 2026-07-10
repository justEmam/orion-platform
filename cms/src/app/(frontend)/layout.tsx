/** Frontend layout: loads the reference design's Google Fonts.
 *  Per-page <title>/description/OG tags come from each page's SEO fields via
 *  generateMetadata (see meta.ts) — not hardcoded here. */
import React from 'react'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
