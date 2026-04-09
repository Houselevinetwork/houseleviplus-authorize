/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
NEXT_PUBLIC_AUTHORIZE_SERVER_URL: process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL || 'https://api.houselevi.com',  },
}

module.exports = nextConfig
