import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/shared'],
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
    return [
      {
        source: '/api/auth/:path*',
        destination: `${target}/api/auth/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${target}/api/v1/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default withNextIntl(nextConfig)
