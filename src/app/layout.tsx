import type { Metadata } from "next";
import { Poppins, Patrick_Hand } from "next/font/google"; // Tambah Poppins
import "./globals.css";

// Setup Font Poppins (Utama)
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

// Setup Font Tulisan Tangan (Untuk Polaroid)
const patrickHand = Patrick_Hand({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-patrick" 
});

export const metadata: Metadata = {
  title: "OSIS MPK SKADUTA",
  description: "Portal Resmi Organisasi SMK N 2 Yogyakarta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${poppins.variable} ${patrickHand.variable} font-poppins bg-white text-gray-800`}>
        {children}
      </body>
    </html>
  );
}