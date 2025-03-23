/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeFonts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Add file watcher options to help with Windows permission issues
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      // Improve file watching on Windows
      config.watchOptions = {
        ignored: /node_modules/,
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },
}

module.exports = nextConfig 