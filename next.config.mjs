/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Wajib buat Cloudflare Pages
  images: {
    unoptimized: true, // Wajib buat Cloudflare biar gambar lokal muncul
  },
};

export default nextConfig;