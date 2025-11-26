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
  },
  // Force Node.js runtime for all routes
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs', '@clerk/backend'],
  },
}

export default nextConfig