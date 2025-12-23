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
    // Allow images from Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

console.log(isCapacitorBuild ? '🤖 Building for CAPACITOR (static export)' : '🌐 Building for WEB (with API routes)');

module.exports = nextConfig
