'use client';

import Image from 'next/image';
import { Instagram, MapPin } from 'lucide-react';

// Definisikan tipe data
interface MemberProps {
  nba: string;
  nama: string;
  kelas: string;
  nama_jabatan: string;
  kode_jabatan?: string;
  bio: string;
  instagram: string;
  foto_url: string;
}

export default function PolaroidCard({ data }: { data: MemberProps }) {
  const placeholderImg = '/placeholder-user.jpg';

  const imageSrc = data.foto_url && data.foto_url.length > 5 
    ? data.foto_url 
    : placeholderImg;

  const cleanIg = (ig: string) => ig.replace('@', '').replace('https://instagram.com/', '').replace('/', '');

  // Fungsi Warna Badge & Aksen Border
  const getThemeColor = (kode: string | undefined) => {
    switch (kode) {
      case '01': // Ketua
      case '02': // Wakil
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', accent: 'bg-purple-500' };
      case '03': // Sekretaris
      case '04': // Bendahara
        return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', accent: 'bg-pink-500' };
      case '05': // Sekbid
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: 'bg-blue-500' };
      default: // Anggota
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', accent: 'bg-slate-500' };
    }
  };

  const theme = getThemeColor(data.kode_jabatan);

  return (
    // --- CONTAINER UTAMA (Professional Card Style) ---
    <div className="group relative flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* --- AREA FOTO --- */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={data.nama}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={true}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.includes('placeholder-user.jpg')) return;
            target.src = placeholderImg;
            target.srcset = placeholderImg;
          }}
        />
        
        {/* Overlay Gradient Halus di Bawah Foto (Supaya teks putih terbaca kalau ada info di atas foto) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        {/* NBA Badge (Minimalis di Pojok Atas) */}
        <div className="absolute top-3 right-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-mono font-bold text-slate-800 backdrop-blur-md shadow-sm border border-white/50">
          {data.nba}
        </div>
      </div>

      {/* --- GARIS AKSEN WARNA (Pemisah Foto & Konten) --- */}
      <div className={`h-1 w-full ${theme.accent}`}></div>

      {/* --- KONTEN TEKS --- */}
      <div className="flex flex-col flex-grow p-5 text-center">
        
        {/* Nama - Font Tegas & Bersih */}
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
          {data.nama}
        </h3>
        
        {/* Kelas */}
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-3">
          <MapPin size={12} />
          <span>{data.kelas}</span>
        </div>

        {/* Badge Jabatan (Pill Shape) */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${theme.bg} ${theme.text} ${theme.border}`}>
            {data.nama_jabatan}
          </span>
        </div>

        {/* Bio Singkat (Line Clamp) */}
        {data.bio && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 italic px-2">
            "{data.bio}"
          </p>
        )}

        {/* Spacer agar tombol selalu di bawah */}
        <div className="mt-auto"></div>

        {/* Tombol Instagram Full Width */}
        {data.instagram && (
          <a
            href={`https://instagram.com/${cleanIg(data.instagram)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-md border border-slate-100"
          >
            <Instagram size={14} />
            @{cleanIg(data.instagram)}
          </a>
        )}
      </div>
    </div>
  );
}