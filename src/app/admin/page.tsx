'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Save, RefreshCw, LogOut, LayoutDashboard, UserPlus, Search, Upload, Image as ImageIcon, X, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [loadingSession, setLoadingSession] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatedNBA, setGeneratedNBA] = useState('');
  
  // State Form
  const [formData, setFormData] = useState({
    nama: '',
    nis: '', 
    kelas: '',
    tahun_lulus: new Date().getFullYear().toString().slice(-2), 
    kode_jabatan: '01',
    nama_jabatan: '',
    bio: '',
    instagram: '',
    foto_url: '',
  });

  // 1. CEK SESSION
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else {
        setLoadingSession(false);
        fetchMembers();
      }
    };
    checkSession();
  }, [router]);

  // 2. GENERATOR NBA
  useEffect(() => {
    const nba = `${formData.tahun_lulus}.${formData.kode_jabatan}.${formData.nis}`;
    setGeneratedNBA(nba);
  }, [formData.tahun_lulus, formData.kode_jabatan, formData.nis]);

  // 3. FETCH DATA
  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FITUR UPLOAD FOTO (YANG SUDAH DIPERBAIKI) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;

      setUploading(true);
      const file = e.target.files[0];
      
      // Validasi Ukuran (Max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File terlalu besar! Maksimal 2MB.");
        setUploading(false);
        return;
      }

      // Bikin nama file unik: nba-timestamp.jpg
      const fileExt = file.name.split('.').pop();
      const fileName = `${generatedNBA}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload ke Supabase
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // 3. Masukkan URL ke Form
      setFormData(prev => ({ ...prev, foto_url: publicUrl }));
      
    } catch (error: any) {
      alert('Gagal Upload: ' + error.message);
    } finally {
      setUploading(false);
      // --- PERBAIKAN PENTING: RESET INPUT ---
      // Ini biar kamu bisa upload ulang file yang sama/ganti file berkali-kali
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Hapus Foto Preview
  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, foto_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SUBMIT DATA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { nba: generatedNBA, ...formData };

    const { error } = await supabase.from('members').upsert(payload);

    if (error) {
      alert('Gagal Simpan: ' + error.message);
    } else {
      alert('✅ Data Berhasil Disimpan!');
      fetchMembers();
      // Reset form (sisakan tahun & jabatan)
      setFormData(prev => ({ ...prev, nis: '', nama: '', bio: '', instagram: '', foto_url: '' }));
      // Reset input file juga
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setLoading(false);
  };

  // DELETE DATA
  const handleDelete = async (nba: string) => {
    if(!confirm("Yakin hapus data ini?")) return;
    await supabase.from('members').delete().eq('nba', nba);
    fetchMembers();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loadingSession) return <div className="flex h-screen items-center justify-center bg-slate-100 text-blue-600 font-bold">Memuat Dashboard...</div>;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="flex w-full flex-col justify-between bg-slate-900 p-6 text-white shadow-xl md:h-screen md:w-72 md:fixed z-50">
        <div>
          <div className="mb-10 flex items-center gap-3 text-yellow-400">
             <div className="rounded-lg bg-yellow-400/20 p-2"><LayoutDashboard size={24} /></div>
             <div>
               <h1 className="text-lg font-bold leading-tight">ADMIN PANEL</h1>
               <span className="text-[10px] text-slate-400 tracking-wider">OSIS MPK SKADUTA</span>
             </div>
          </div>
          
          <nav className="space-y-3">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white">
               <Search size={18} /> Lihat Website Utama
            </Link>
            <div className="flex items-center gap-3 rounded-xl bg-blue-600 p-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40">
               <UserPlus size={18} /> Database Anggota
            </div>
          </nav>
        </div>

        <button onClick={handleLogout} className="mt-8 flex w-full items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-600 hover:text-white">
          <LogOut size={18} /> Keluar
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:ml-72 md:p-10">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Anggota</h1>
            <p className="mt-1 text-slate-500">Input data pengurus baru dan kelola database.</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-2 shadow-sm border">
            <span className="text-sm font-medium text-slate-500">Total Data:</span>
            <span className="text-xl font-bold text-blue-600">{members.length}</span>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* --- FORM INPUT (4 Kolom) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-6 flex items-center gap-2 border-b pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"><UserPlus size={16} /></div>
                <h3 className="font-bold text-slate-700">Form Input Data</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* PREVIEW NBA */}
                <div className="rounded-xl bg-slate-50 p-4 text-center border border-slate-200 border-dashed">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Generated NBA</label>
                  <div className="font-mono text-2xl font-black tracking-widest text-blue-600">{generatedNBA || '...'}</div>
                </div>

                {/* AREA UPLOAD FOTO */}
                <div>
                   <label className="mb-2 block text-xs font-bold text-slate-500">Foto Profil (3x4)</label>
                   <div className="flex gap-4">
                      {/* Kotak Preview */}
                      <div className="relative h-40 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 shadow-inner group">
                        {formData.foto_url ? (
                          <>
                            <img src={formData.foto_url} alt="Preview" className="h-full w-full object-cover transition group-hover:opacity-70" />
                            {/* Tombol Hapus Kecil di Pojok */}
                            <button 
                              type="button" 
                              onClick={handleRemovePhoto}
                              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 z-10"
                              title="Hapus Foto"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                             {uploading ? <RefreshCw className="animate-spin text-blue-500" /> : <ImageIcon size={24} />}
                             <span className="mt-2 text-[10px]">{uploading ? 'Loading...' : '3 x 4'}</span>
                          </div>
                        )}
                        
                        {/* Overlay Loading saat Upload */}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                             <RefreshCw className="animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Tombol Upload */}
                      <div className="flex flex-col justify-center gap-2 w-full">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden" 
                          id="upload-btn"
                          disabled={!formData.nis || uploading} 
                        />
                        <label 
                          htmlFor="upload-btn" 
                          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition select-none ${
                            !formData.nis 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm'
                          }`}
                        >
                          {formData.foto_url ? (
                             <><Edit size={16} /> Ganti Foto</>
                          ) : (
                             <><Upload size={16} /> {uploading ? 'Mengupload...' : 'Pilih Foto'}</>
                          )}
                        </label>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {!formData.nis ? (
                            <span className="text-red-400 font-bold">*Wajib isi NIS dulu!</span>
                          ) : (
                            "*Format JPG/PNG. Max 2MB."
                          )}
                        </p>
                      </div>
                   </div>
                </div>

                {/* INPUT FIELDS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Thn Lulus</label>
                    <input name="tahun_lulus" maxLength={2} value={formData.tahun_lulus} onChange={handleInputChange} className="w-full rounded-lg border bg-slate-50 p-2.5 text-center text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none" placeholder="26" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Kode Jabatan</label>
                    <select name="kode_jabatan" value={formData.kode_jabatan} onChange={handleInputChange} className="w-full rounded-lg border bg-slate-50 p-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none">
                      <option value="01">01-Ketua</option>
                      <option value="02">02-Wakil</option>
                      <option value="03">03-Sekretaris</option>
                      <option value="04">04-Bendahara</option>
                      <option value="05">05-Sekbid</option>
                      <option value="06">06-Anggota</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">NIS Sekolah</label>
                  <input name="nis" value={formData.nis} onChange={handleInputChange} placeholder="Contoh: 24091706" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                </div>

                <div className="space-y-3 pt-2">
                  <input name="nama" value={formData.nama} onChange={handleInputChange} placeholder="Nama Lengkap" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                  <input name="nama_jabatan" value={formData.nama_jabatan} onChange={handleInputChange} placeholder="Nama Jabatan (Display)" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                  <input name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="Kelas (XI SIJA 1)" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                  <input name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="Instagram (Opsional)" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                </div>

                <button disabled={loading || uploading} type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  SIMPAN ANGGOTA
                </button>
              </form>
            </div>
          </div>

          {/* --- TABEL DATA (8 Kolom) --- */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr className="border-b">
                      <th className="p-5">Profil Anggota</th>
                      <th className="p-5">Jabatan</th>
                      <th className="p-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.length === 0 ? (
                      <tr><td colSpan={3} className="p-10 text-center text-slate-400 italic">Belum ada data.</td></tr>
                    ) : (
                      members.map((m) => (
                        <tr key={m.nba} className="group hover:bg-blue-50/30 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 shadow-sm border border-slate-100">
                                {m.foto_url ? (
                                  <img src={m.foto_url} alt={m.nama} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageIcon size={16}/></div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{m.nama}</div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                   <span className="font-mono bg-slate-100 px-1 rounded">{m.nba}</span>
                                   <span>•</span>
                                   <span>{m.kelas}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                               m.kode_jabatan === '01' || m.kode_jabatan === '02' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                               m.kode_jabatan === '05' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                               'bg-green-50 text-green-700 ring-green-600/20'
                            }`}>
                              {m.nama_jabatan}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => handleDelete(m.nba)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                              title="Hapus Data"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}