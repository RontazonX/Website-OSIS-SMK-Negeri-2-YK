/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Wajib untuk Cloudflare Pages (biar jadi file HTML statis)
  output: 'export',

  // 2. Matikan optimasi gambar server (Wajib karena CF Pages gak punya server gambar)
  images: {
    unoptimized: true, 
  },
  
  // 3. Matikan indikator dev (opsional, biar bersih)
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;