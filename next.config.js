/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    NEXT_PUBLIC_AUTHORIZE_SERVER_URL: process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL || 'http://localhost:3002',
  },
}

module.exports = nextConfig
