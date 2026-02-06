/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        // Ganti tanda bintang (*) dengan project ID supabase kamu jika mau lebih spesifik
        // Tapi pakai hostname ini sudah cukup aman
        hostname: '*https://uufhbsxihllqxlmhcupz.supabase.co', 
      },
    ],
  },
};

export default nextConfig;