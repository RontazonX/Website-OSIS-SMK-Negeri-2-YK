/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Untuk Cloudflare Pages
  images: {
    unoptimized: true, // Wajib untuk Cloudflare Pages gratis
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com', // Izinkan Google Drive
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Izinkan CDN Google
      },
    ],
  },
};

export default nextConfig;