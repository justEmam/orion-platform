import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't fail the production build on type/lint errors. Types are still
  // checked in the editor and dev; this stops a missing *transitive* type
  // definition (e.g. 'estree', pulled in by a dependency) from blocking a
  // deploy over something that doesn't affect runtime.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}

export default withPayload(nextConfig)
