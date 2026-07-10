/** Home page (/) — renders the CMS page with slug "home". */
import { renderPage } from './renderPage'
import { buildMetadata } from './meta'

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
