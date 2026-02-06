'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PolaroidCard from '@/components/PolaroidCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, Instagram, Youtube, User, 
  Send, ArrowRight, Calendar, Trophy, Megaphone, Loader2
} from 'lucide-react';

// --- Tipe Data ---
interface Member {
  nba: string;
  nama: string;
  kelas: string;
  nama_jabatan: string;
  kode_jabatan: string;
  bio: string;
  instagram: string;
  foto_url: string;
}

export default function Home() {
  // --- STATE LOGIC UTAMA ---
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);

  // --- STATE KHUSUS ASPIRASI ---
  const [loadingAspirasi, setLoadingAspirasi] = useState(false);
  const [formAspirasi, setFormAspirasi] = useState({
    nama: '',
    kelas: '',
    pesan: ''
  });

  // 1. Fungsi Handle Scroll
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 2. Fungsi Kirim Aspirasi (Ke Database Supabase)
  const handleKirimAspirasi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formAspirasi.pesan.trim()) {
      alert("Mohon isi pesan aspirasi kamu ya!");
      return;
    }

    setLoadingAspirasi(true);

    try {
      const { error } = await supabase.from('aspirations').insert([
        {
          nama: formAspirasi.nama || 'Anonim',
          kelas: formAspirasi.kelas || '-',
          pesan: formAspirasi.pesan
        }
      ]);

      if (error) throw error;

      alert("Terima kasih! Aspirasi kamu berhasil dikirim.");
      setFormAspirasi({ nama: '', kelas: '', pesan: '' }); 

    } catch (error: any) {
      alert("Gagal mengirim aspirasi: " + error.message);
    } finally {
      setLoadingAspirasi(false);
    }
  };

  // 3. Efek Scroll Navbar
  useEffect(() => {
    const handleScrollEvent = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  // 4. Fetch Data Database Anggota
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('nba', { ascending: true });
      
      if (!error && data) {
        setMembers(data);
        setFilteredMembers(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // 5. Logic Filter
  useEffect(() => {
    let result = members;
    if (searchQuery) {
      result = result.filter((m) =>
        m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nba.includes(searchQuery)
      );
    }
    if (selectedJabatan !== 'All') {
      result = result.filter((m) => m.nama_jabatan.includes(selectedJabatan));
    }
    setFilteredMembers(result);
  }, [searchQuery, selectedJabatan, members]);

  return (
    <main className="font-sans text-slate-800">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="#" onClick={(e) => handleScroll(e, 'beranda')} className={`flex items-center gap-3 font-bold text-xl ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
            <div className="relative h-10 w-10"> 
               {/* FOLDER PUBLIC */}
               <Image 
                 src="/images/Logo-Nav.png" 
                 alt="Logo OSIS" 
                 fill
                 className="object-contain" 
                 priority
               />
            </div>
            <span>OSIS MPK<span className="font-light">SKADUTA</span></span>
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            {['Beranda', 'Tentang', 'Struktur', 'Galeri', 'Berita', 'Anggota'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                onClick={(e) => handleScroll(e, item.toLowerCase())} 
                className={`text-sm font-bold uppercase tracking-wide transition hover:text-yellow-400 ${isScrolled ? 'text-slate-600' : 'text-white/90'}`}
              >
                {item}
              </a>
            ))}
            <a 
              href="#aspirasi" 
              onClick={(e) => handleScroll(e, 'aspirasi')}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-600/30"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="beranda" className="relative flex h-screen items-center justify-center text-center text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* FOLDER PUBLIC */}
          <Image 
             src="/images/hero-bg.jpg" 
             alt=""
             fill
             className="object-cover opacity-50"
             priority
          />
          <iframe
            className="absolute top-1/2 left-1/2 min-w-[200%] min-h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-60"
            src="https://www.youtube.com/embed/OM88Muxs10w?autoplay=1&mute=1&controls=0&loop=1&playlist=OM88Muxs10w&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&start=10"
            title="Profil SMKN 2 Yogyakarta"
            allow="autoplay; encrypted-media" 
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/90"></div>
        </div>

        <div className="relative z-20 container px-4 mt-[-50px]">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-4xl font-extrabold md:text-6xl lg:text-7xl drop-shadow-2xl leading-tight">
              Selamat Datang di <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Website Resmi OSIS & MPK SKADUTA
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 drop-shadow-md font-light leading-relaxed">
              Mewujudkan Generasi Skaduta yang Berkarakter, Kompeten, dan Berintegritas melalui kolaborasi nyata.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <a 
                href="#anggota" 
                onClick={(e) => handleScroll(e, 'anggota')}
                className="group relative overflow-hidden rounded-full bg-blue-600 px-8 py-3.5 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              >
                <span className="relative z-10">Lihat Anggota</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300 skew-x-12"></div>
              </a>
              <a 
                href="#tentang" 
                onClick={(e) => handleScroll(e, 'tentang')}
                className="group rounded-full bg-white/5 backdrop-blur-sm border border-white/20 px-8 py-3.5 text-lg font-bold text-white transition-all hover:bg-white/10 hover:border-white/40 hover:scale-105"
              >
                Tentang Kami
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- TENTANG KAMI --- */}
      <section id="tentang" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-2xl group">
              {/* FOLDER PUBLIC */}
              <Image 
                src="/images/tentang-kami.png" 
                alt="Tentang Kami" 
                fill 
                className="object-cover transition duration-500 group-hover:scale-110"
                unoptimized
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">Siapa Kami?</h3>
              <h2 className="mb-6 text-4xl font-bold text-slate-900">Wadah Aspirasi & Kreativitas</h2>
              <p className="mb-6 text-slate-600 leading-relaxed text-lg">
                OSIS & MPK SMK Negeri 2 Yogyakarta adalah garda terdepan dalam pengembangan karakter siswa. Kami berkomitmen mendukung visi sekolah dalam mencetak lulusan siap kerja.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="text-4xl font-black text-slate-800">50+</h4>
                  <p className="text-sm font-medium text-slate-500">Pengurus Aktif</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h4 className="text-4xl font-black text-slate-800">12</h4>
                  <p className="text-sm font-medium text-slate-500">Program Kerja</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- STRUKTUR ORGANISASI (PUBLIC FOLDER) --- */}
      <section id="struktur" className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h6 className="mb-2 text-sm font-bold uppercase text-blue-600 tracking-widest">Organigram</h6>
            <h2 className="text-3xl font-bold text-slate-900">Struktur Pengurus OSIS</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-4 -mx-4 scrollbar-hide">
            {[
              // PASTIKAN FILE ADA DI FOLDER public/images/
              { title: "Ketua & Wakil Umum", image: "/images/ketua.jpg", desc: "Penanggung Jawab Utama" },
              { title: "Sekretaris Umum", image: "/images/sekretaris.jpg", desc: "Administrasi & Surat Menyurat" },
              { title: "Bendahara Umum", image: "/images/bendahara.jpg", desc: "Manajemen Keuangan" },
              { title: "Sie Hubungan Masyarakat", image: "/images/humas.jpg", desc: "Komunikasi & Publikasi" },
              { title: "Sie Basecamp", image: "/images/basecamp.jpg", desc: "Logistik & Rumah Tangga" },
              { title: "Koordinator Bidang", image: "/images/koordinator.jpg", desc: "Supervisi Sekbid 1-6" },
              { title: "Sekbid 1: Ketuhanan YME", image: "/images/sekbid1.jpg", desc: "Kerohanian & Toleransi" },
              { title: "Sekbid 2: Bela Negara", image: "/images/sekbid2.jpg", desc: "Budi Pekerti Luhur" },
              { title: "Sekbid 3: TIK", image: "/images/sekbid3.jpg", desc: "Teknologi & Informasi" },
              { title: "Sekbid 4: Kewirausahaan", image: "/images/sekbid4.jpg", desc: "Keterampilan & Usaha" },
              { title: "Sekbid 5: Jasmani & Kesehatan", image: "/images/sekbid5.jpg", desc: "Olahraga & Gizi" },
              { title: "Sekbid 6: Seni & Budaya", image: "/images/sekbid6.jpg", desc: "Sastra & Kreativitas" },
            ].map((item, index) => (
              <div key={index} className="snap-center shrink-0 w-[300px] group bg-white p-4 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200">
                <div className="relative h-[250px] w-full bg-slate-100 mb-4 overflow-hidden border border-slate-100 shadow-inner">
                  {/* Panggil dari path lokal */}
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized 
                  />
                </div>
                <div className="text-center px-2">
                   <h5 className="text-lg font-bold text-slate-800 leading-tight mb-1">{item.title}</h5>
                   <p className="text-xs text-slate-500 font-medium italic">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- GALERI KEGIATAN (PUBLIC FOLDER) --- */}
      <section id="galeri" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h6 className="font-bold uppercase text-blue-600 tracking-widest mb-2 text-sm">Dokumentasi</h6>
            <h2 className="text-3xl font-bold text-slate-900">Galeri Kegiatan Skaduta</h2>
            <p className="text-slate-500 mt-2">Momen-momen seru yang tak terlupakan.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[500px]">
            <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl cursor-pointer">
              <Image src="/images/galeri-1.jpg" alt="Utama" fill className="object-cover transition duration-700 group-hover:scale-110" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <p className="text-white font-bold text-lg">Classmeeting 2024</p>
              </div>
            </div>
            <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl cursor-pointer">
              <Image src="/images/galeri-2.jpg" alt="Musik" fill className="object-cover transition duration-700 group-hover:scale-110" unoptimized />
            </div>
            <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl cursor-pointer">
              <Image src="/images/galeri-3.jpg" alt="Upacara" fill className="object-cover transition duration-700 group-hover:scale-110" unoptimized />
            </div>
            <div className="col-span-2 md:col-span-2 relative group overflow-hidden rounded-2xl cursor-pointer">
              <Image src="/images/galeri-4.jpg" alt="Rapat" fill className="object-cover transition duration-700 group-hover:scale-110" unoptimized />
               <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <p className="text-white font-bold">LDK Pengurus Baru</p>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* --- BERITA & AGENDA (PUBLIC FOLDER) --- */}
      <section id="berita" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Berita & Agenda</h2>
              <p className="text-slate-500 mt-2">Update terbaru seputar kegiatan sekolah.</p>
            </div>
            <a href="#" className="px-6 py-2 rounded-full border border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition">
              Lihat Arsip
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden group border border-slate-100">
              <div className="h-48 relative overflow-hidden">
                <Image src="/images/berita-1.jpg" alt="Berita 1" fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  <Calendar size={12} /> Agenda
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-2 mb-2">28 Okt 2024</span>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">Pemilihan Ketua OSIS</h3>
                <p className="text-slate-500 text-sm line-clamp-2">Jangan lupa gunakan hak pilihmu! Saksikan orasi kandidat di lapangan utama.</p>
              </div>
            </article>
            <article className="bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden group border border-slate-100">
              <div className="h-48 relative overflow-hidden">
                <Image src="/images/berita-2.jpg" alt="Berita 2" fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                <div className="absolute top-4 left-4 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  <Trophy size={12} /> Prestasi
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-2 mb-2">15 Sep 2024</span>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">Juara 1 Lomba Robotik</h3>
                <p className="text-slate-500 text-sm line-clamp-2">Tim Robotik Skaduta kembali mengharumkan nama sekolah di kancah nasional.</p>
              </div>
            </article>
            <article className="bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden group border border-slate-100">
              <div className="h-48 relative overflow-hidden">
                <Image src="/images/berita-3.jpg" alt="Berita 3" fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                 <div className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  <Megaphone size={12} /> Info
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-2 mb-2">10 Sep 2024</span>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">Open Recruitment MPK</h3>
                <p className="text-slate-500 text-sm line-clamp-2">Ingin berkontribusi lebih untuk sekolah? Daftarkan dirimu sekarang juga!</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* --- DATABASE ANGGOTA --- */}
      <section id="anggota" className="py-20 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Database Anggota</h2>
            <p className="text-slate-500">Cari teman atau pengurus favoritmu di sini</p>
          </div>
          <div className="mx-auto mb-12 max-w-4xl rounded-2xl bg-white p-4 shadow-xl border border-slate-100">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama, kelas, atau NIS..." 
                  className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition border border-transparent focus:border-blue-200 text-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {['All', 'Ketua', 'Sekretaris', 'Bendahara', 'Sekbid'].map((jabatan) => (
                  <button
                    key={jabatan}
                    onClick={() => setSelectedJabatan(jabatan)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      selectedJabatan === jabatan 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {jabatan === 'All' ? 'Semua' : jabatan}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {loading ? (
             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 w-full animate-pulse rounded bg-slate-200"></div>
                ))}
             </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <PolaroidCard key={member.nba} data={member} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400">
                  <User size={64} className="mx-auto mb-4 opacity-20"/>
                  <p className="text-lg">Anggota tidak ditemukan.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* --- FORM ASPIRASI --- */}
      <section id="aspirasi" className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Kotak Aspirasi</h2>
            <p className="mb-8 text-slate-600">
              Punya ide cemerlang untuk Skaduta? Sampaikan suaramu di sini, identitasmu aman.
            </p>

            <form onSubmit={handleKirimAspirasi} className="rounded-2xl bg-white p-8 shadow-xl text-left border border-slate-100">
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">Nama (Boleh Samaran)</label>
                <input 
                  type="text" 
                  value={formAspirasi.nama}
                  onChange={(e) => setFormAspirasi({...formAspirasi, nama: e.target.value})}
                  placeholder="Siswa Skaduta" 
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">Kelas / Jurusan</label>
                <input 
                  type="text" 
                  value={formAspirasi.kelas}
                  onChange={(e) => setFormAspirasi({...formAspirasi, kelas: e.target.value})}
                  placeholder="Contoh: XI SIJA 1" 
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">Pesan Aspirasi <span className="text-red-500">*</span></label>
                <textarea 
                  rows={4} 
                  value={formAspirasi.pesan}
                  onChange={(e) => setFormAspirasi({...formAspirasi, pesan: e.target.value})}
                  placeholder="Tulis aspirasimu..." 
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loadingAspirasi}
                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingAspirasi ? (
                  <> <Loader2 className="animate-spin" size={18} /> Mengirim... </>
                ) : (
                  <> <Send size={18} /> Kirim Aspirasi </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 py-12 text-white border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h5 className="mb-4 text-xl font-bold text-yellow-400">OSIS MPK SKADUTA</h5>
              <p className="text-slate-400 text-sm leading-relaxed">
                SMK Negeri 2 Yogyakarta.<br />
                Jl. AM. Sangaji No.47, Cokrodiningratan, Jetis, Yogyakarta.
              </p>
            </div>
            <div>
              <h5 className="mb-4 text-lg font-bold">Tautan Cepat</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#beranda" onClick={(e) => handleScroll(e, 'beranda')} className="hover:text-white transition">Beranda</a></li>
                <li><a href="#anggota" onClick={(e) => handleScroll(e, 'anggota')} className="hover:text-white transition">Database Anggota</a></li>
                <li><a href="#" className="hover:text-white transition">Recruitment</a></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-lg font-bold">Ikuti Kami</h5>
              <div className="flex gap-4">
                <a href="#" className="rounded bg-white/10 p-2 transition hover:bg-pink-600 hover:text-white"><Instagram size={20} /></a>
                <a href="#" className="rounded bg-white/10 p-2 transition hover:bg-red-600 hover:text-white"><Youtube size={20} /></a>
              </div>
            </div>
          </div>
          <hr className="my-8 border-slate-800" />
          <div className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Tim IT OSIS SMKN 2 Yogyakarta.
          </div>
        </div>
      </footer>
    </main>
  );
}