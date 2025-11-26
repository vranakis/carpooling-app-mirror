/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['img.clerk.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    nodeMiddleware: true,
  },
  serverExternalPackages: ['@clerk/nextjs', '@clerk/backend'],
}

export default nextConfig