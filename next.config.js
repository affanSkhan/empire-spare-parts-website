/** @type {import('next').NextConfig} */

// Check if building for Capacitor (APK)
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  reactStrictMode: true,
  // Only use static export when building for Capacitor (APK)
  // For production website, we need the API routes to work
  ...(isCapacitorBuild && {
    output: 'export', // Required for Capacitor - exports static files
  }),
  images: {
    unoptimized: isCapacitorBuild, // Only unoptimize for Capacitor
    // Keep image optimization enabled for the web build.
    // Supabase is the CMS source for catalogue imagery; Unsplash is used only for the homepage hero.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.empirecarac.in',
        pathname: '/showcase/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512, 768],
  },
}

console.log(isCapacitorBuild ? '🤖 Building for CAPACITOR (static export)' : '🌐 Building for WEB (with API routes)');

module.exports = nextConfig
