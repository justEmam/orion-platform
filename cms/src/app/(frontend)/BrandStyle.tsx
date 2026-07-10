/**
 * Injects the Brand colors from the CMS as CSS-variable overrides, so changing
 * a color in the admin actually re-themes the whole site. The theme.css design
 * references --void-black, --beam-blue, --gold, --text, --text-muted; here we
 * override those :root values with the client's chosen colors.
 */
import React from 'react'

type Colors = {
  voidBlack?: string
  beamBlue?: string
  gold?: string
  text?: string
  textMuted?: string
}

export function BrandStyle({ colors }: { colors?: Colors }) {
  if (!colors) return null
  const rules: string[] = []
  if (colors.voidBlack) rules.push(`--void-black:${colors.voidBlack};`)
  if (colors.beamBlue) rules.push(`--beam-blue:${colors.beamBlue};`)
  if (colors.gold) rules.push(`--gold:${colors.gold};`)
  if (colors.text) rules.push(`--text:${colors.text};`)
  if (colors.textMuted) rules.push(`--text-muted:${colors.textMuted};`)
  if (!rules.length) return null
  return <style dangerouslySetInnerHTML={{ __html: `:root{${rules.join('')}}` }} />
}
