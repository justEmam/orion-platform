'use client'
/**
 * Refreshes the previewed page when the client hits Save in the admin.
 * Reliable, WordPress-like behavior (edit -> Save -> preview updates). Uses
 * Payload's official RefreshRouteOnSave — no fragile as-you-type re-fetching
 * (which caused NaN id queries), so the preview pane just works.
 */
import { RefreshRouteOnSave as PayloadRefresh } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export function RefreshOnSave() {
  const router = useRouter()
  return <PayloadRefresh refresh={() => router.refresh()} serverURL={baseURL} />
}
