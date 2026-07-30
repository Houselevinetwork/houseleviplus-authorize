/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://authorization-server-594777920816.europe-west1.run.app',
  },
  // headers() has no effect under output: 'export' (no server to apply it
  // at request time) -- the same security headers are now in public/_headers,
  // which Cloudflare Pages reads and applies at the edge.
}

module.exports = nextConfig
