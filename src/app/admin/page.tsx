'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Save, RefreshCw, LogOut, LayoutDashboard, UserPlus, 
  Search, Upload, Image as ImageIcon, X, Edit, MessageSquare, 
  Inbox, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'anggota' | 'aspirasi'>('anggota');
  const [loadingSession, setLoadingSession] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [aspirations, setAspirations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatedNBA, setGeneratedNBA] = useState('');
  
  // State Form Anggota
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
        fetchAspirations();
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

  const fetchAspirations = async () => {
    // Pastikan tabel 'aspirations' sudah dibuat di Supabase
    const { data } = await supabase.from('aspirations').select('*').order('created_at', { ascending: false });
    if (data) setAspirations(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPLOAD FOTO ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        alert("File terlalu besar! Maksimal 2MB.");
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${generatedNBA}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, foto_url: publicUrl }));
      
    } catch (error: any) {
      alert('Gagal Upload: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, foto_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- CRUD OPERATIONS ---
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
      setFormData(prev => ({ ...prev, nis: '', nama: '', bio: '', instagram: '', foto_url: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setLoading(false);
  };

  const handleDeleteMember = async (nba: string) => {
    if(!confirm("Yakin hapus data ini?")) return;
    await supabase.from('members').delete().eq('nba', nba);
    fetchMembers();
  };

  const handleDeleteAspiration = async (id: number) => {
    if(!confirm("Hapus pesan aspirasi ini?")) return;
    await supabase.from('aspirations').delete().eq('id', id);
    fetchAspirations();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loadingSession) return <div className="flex h-screen items-center justify-center bg-slate-100 text-blue-600 font-bold animate-pulse">Memuat Dashboard...</div>;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50 font-sans text-slate-800">
      
      {/* --- SIDEBAR --- */}
      <aside className="flex w-full flex-col justify-between bg-slate-900 p-6 text-white shadow-xl md:h-screen md:w-72 md:fixed z-50">
        <div>
          <div className="mb-10 flex items-center gap-3 text-yellow-400">
             <div className="rounded-lg bg-yellow-400/20 p-2"><LayoutDashboard size={24} /></div>
             <div>
               <h1 className="text-lg font-bold leading-tight">ADMIN PANEL</h1>
               <span className="text-[10px] text-slate-400 tracking-wider">OSIS MPK SKADUTA</span>
             </div>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('anggota')}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition ${
                activeTab === 'anggota' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
               <UserPlus size={18} /> Database Anggota
            </button>
            
            <button 
              onClick={() => setActiveTab('aspirasi')}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition ${
                activeTab === 'aspirasi' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
               <Inbox size={18} /> Kotak Aspirasi
               {aspirations.length > 0 && (
                 <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">{aspirations.length}</span>
               )}
            </button>

            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white mt-8">
               <Search size={18} /> Lihat Website Utama
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className="mt-8 flex w-full items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-600 hover:text-white">
          <LogOut size={18} /> Keluar
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:ml-72 md:p-10 overflow-y-auto">
        
        {/* HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === 'anggota' ? 'Manajemen Anggota' : 'Kotak Aspirasi Siswa'}
            </h1>
            <p className="mt-1 text-slate-500">
              {activeTab === 'anggota' 
                ? 'Input data pengurus baru dan kelola database.' 
                : 'Pesan dan masukan yang dikirim melalui website utama.'}
            </p>
          </div>
        </header>

        {/* --- KONTEN TAB: ANGGOTA --- */}
        {activeTab === 'anggota' && (
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* FORM INPUT (Kiri) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="mb-6 flex items-center gap-2 border-b pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"><UserPlus size={16} /></div>
                  <h3 className="font-bold text-slate-700">Form Input Data</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="rounded-xl bg-slate-50 p-4 text-center border border-slate-200 border-dashed">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Generated NBA</label>
                    <div className="font-mono text-2xl font-black tracking-widest text-blue-600">{generatedNBA || '...'}</div>
                  </div>

                  {/* Upload Foto */}
                  <div>
                     <label className="mb-2 block text-xs font-bold text-slate-500">Foto Profil (3x4)</label>
                     <div className="flex gap-4">
                        <div className="relative h-40 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 shadow-inner group">
                          {formData.foto_url ? (
                            <>
                              <img src={formData.foto_url} alt="Preview" className="h-full w-full object-cover transition group-hover:opacity-70" />
                              <button type="button" onClick={handleRemovePhoto} className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 z-10"><X size={12} /></button>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                               {uploading ? <RefreshCw className="animate-spin text-blue-500" /> : <ImageIcon size={24} />}
                               <span className="mt-2 text-[10px]">{uploading ? 'Loading...' : '3 x 4'}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center gap-2 w-full">
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" id="upload-btn" disabled={!formData.nis || uploading} />
                          <label htmlFor="upload-btn" className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition select-none ${!formData.nis ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm'}`}>
                            {formData.foto_url ? <><Edit size={16} /> Ganti Foto</> : <><Upload size={16} /> {uploading ? '...' : 'Pilih Foto'}</>}
                          </label>
                          <p className="text-[10px] text-slate-400">{!formData.nis ? <span className="text-red-400 font-bold">*Isi NIS dulu!</span> : "*Max 2MB."}</p>
                        </div>
                     </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-500">Thn Lulus</label>
                      <input name="tahun_lulus" maxLength={2} value={formData.tahun_lulus} onChange={handleInputChange} className="w-full rounded-lg border bg-slate-50 p-2.5 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200" required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-500">Jabatan</label>
                      <select name="kode_jabatan" value={formData.kode_jabatan} onChange={handleInputChange} className="w-full rounded-lg border bg-slate-50 p-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200">
                        <option value="01">01-Ketua</option>
                        <option value="02">02-Wakil</option>
                        <option value="03">03-Sekretaris</option>
                        <option value="04">04-Bendahara</option>
                        <option value="05">05-Sekbid</option>
                        <option value="06">06-Anggota</option>
                      </select>
                    </div>
                  </div>
                  <input name="nis" value={formData.nis} onChange={handleInputChange} placeholder="NIS Sekolah (Cth: 240917)" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                  <input name="nama" value={formData.nama} onChange={handleInputChange} placeholder="Nama Lengkap" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                  <input name="nama_jabatan" value={formData.nama_jabatan} onChange={handleInputChange} placeholder="Nama Jabatan Display" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />
                  <input name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="Kelas" className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" required />

                  <button disabled={loading || uploading} type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50">
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} SIMPAN
                  </button>
                </form>
              </div>
            </div>

            {/* TABEL ANGGOTA (Kanan) */}
            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <tr className="border-b"><th className="p-5">Profil</th><th className="p-5">Jabatan</th><th className="p-5 text-right">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((m) => (
                        <tr key={m.nba} className="hover:bg-blue-50/30">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-200">
                                {m.foto_url ? <img src={m.foto_url} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageIcon size={16}/></div>}
                              </div>
                              <div><div className="font-bold text-slate-800">{m.nama}</div><div className="text-xs text-slate-500">{m.nba} • {m.kelas}</div></div>
                            </div>
                          </td>
                          <td className="p-5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{m.nama_jabatan}</span></td>
                          <td className="p-5 text-right"><button onClick={() => handleDeleteMember(m.nba)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- KONTEN TAB: ASPIRASI --- */}
        {activeTab === 'aspirasi' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aspirations.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Inbox size={64} className="mb-4 opacity-20" />
                <p>Belum ada aspirasi yang masuk.</p>
              </div>
            ) : (
              aspirations.map((msg) => (
                <div key={msg.id} className="relative rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-xl transition group">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {msg.nama ? msg.nama.charAt(0).toUpperCase() : 'A'}
                       </div>
                       <div>
                          <h4 className="font-bold text-sm text-slate-800">{msg.nama || 'Anonim'}</h4>
                          <p className="text-[10px] text-slate-500">{msg.kelas || 'Siswa Skaduta'}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 italic leading-relaxed">
                    "{msg.pesan}"
                  </div>

                  <div className="flex justify-end gap-2">
                     {/* Tombol Hapus */}
                     <button 
                       onClick={() => handleDeleteAspiration(msg.id)}
                       className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                       title="Hapus Pesan"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}