'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trash2, Save, LogOut, LayoutGrid, Users, 
  Upload, Image as ImageIcon, X, MessageSquare, 
  Inbox, Bell, Search, ChevronRight, Loader2
} from 'lucide-react';
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
  
  // State Form
  const [formData, setFormData] = useState({
    nama: '', nis: '', kelas: '',
    tahun_lulus: new Date().getFullYear().toString().slice(-2), 
    kode_jabatan: '01', nama_jabatan: '', bio: '', instagram: '', foto_url: '',
  });

  // --- 1. CEK SESSION & FETCH AWAL ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else {
        setLoadingSession(false);
        fetchMembers();
        fetchAspirations();
      }
    };
    init();
  }, [router]);

  // --- 2. 🔥 REALTIME LISTENER (FITUR BARU) ---
  useEffect(() => {
    // Channel untuk mendengarkan perubahan di database
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembers(); // Refresh data anggota otomatis
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aspirations' }, () => {
        fetchAspirations(); // Refresh aspirasi otomatis
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- HELPER FUNCTIONS ---
  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
  };

  const fetchAspirations = async () => {
    const { data } = await supabase.from('aspirations').select('*').order('created_at', { ascending: false });
    if (data) setAspirations(data);
  };

  const generateNBA = () => {
    const nba = `${formData.tahun_lulus}.${formData.kode_jabatan}.${formData.nis}`;
    setGeneratedNBA(nba);
  };

  useEffect(() => { generateNBA() }, [formData.tahun_lulus, formData.kode_jabatan, formData.nis]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPLOAD IMAGE (SUPABASE STORAGE) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      
      // Upload ke bucket 'images'
      const fileName = `${generatedNBA}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      
      if (error) throw error;

      // Kita simpan NAMA FILE SAJA biar konsisten dengan page.tsx
      setFormData(prev => ({ ...prev, foto_url: fileName }));
      
    } catch (error: any) {
      alert('Gagal Upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simpan nama file saja ke database
    const payload = { nba: generatedNBA, ...formData };
    
    const { error } = await supabase.from('members').upsert(payload);
    if (!error) {
      // Reset Form
      setFormData({ ...formData, nis: '', nama: '', foto_url: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleDeleteMember = async (nba: string) => {
    if(confirm("Hapus anggota ini?")) await supabase.from('members').delete().eq('nba', nba);
  };

  const handleDeleteAspiration = async (id: number) => {
    if(confirm("Hapus pesan ini?")) await supabase.from('aspirations').delete().eq('id', id);
  };

  // Helper untuk menampilkan gambar di admin (karena kita cuma simpan nama file)
  // Ganti Project ID dengan milikmu
  const getAdminImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Handle kalau ada yg save full URL
    return `https://uufhbsxihllqxlmhcupz.supabase.co/storage/v1/object/public/images/${path}`;
  };

  if (loadingSession) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-800">
      
      {/* --- SIDEBAR MODERN --- */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-20 flex-col items-center justify-between bg-slate-900 py-8 shadow-2xl transition-all duration-300 hover:w-64 group md:flex">
        <div className="flex flex-col items-center w-full">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/50">
            <LayoutGrid size={24} />
          </div>
          
          <nav className="w-full space-y-2 px-3">
            <button onClick={() => setActiveTab('anggota')} className={`flex w-full items-center gap-4 rounded-xl p-3 transition-all ${activeTab === 'anggota' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Users size={20} className="shrink-0" />
              <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Data Anggota</span>
            </button>
            <button onClick={() => setActiveTab('aspirasi')} className={`flex w-full items-center gap-4 rounded-xl p-3 transition-all ${activeTab === 'aspirasi' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="relative">
                <Inbox size={20} className="shrink-0" />
                {aspirations.length > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
              </div>
              <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Aspirasi Siswa</span>
            </button>
          </nav>
        </div>

        <button onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} className="mb-4 flex w-[90%] items-center gap-4 rounded-xl bg-red-500/10 p-3 text-red-400 hover:bg-red-600 hover:text-white transition-all overflow-hidden">
          <LogOut size={20} className="shrink-0 mx-auto group-hover:mx-0" />
          <span className="whitespace-nowrap font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Keluar</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 pl-20 transition-all duration-300">
        <div className="container mx-auto p-8 max-w-7xl">
          
          {/* HEADER */}
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {activeTab === 'anggota' ? 'Dashboard Pengurus' : 'Kotak Masuk Aspirasi'}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                System Real-time Active
              </p>
            </div>
            
            {/* STATS CARDS */}
            <div className="flex gap-4">
               <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={18} /></div>
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase">Anggota</p>
                   <p className="text-xl font-black text-slate-800">{members.length}</p>
                 </div>
               </div>
               <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                 <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><MessageSquare size={18} /></div>
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase">Pesan</p>
                   <p className="text-xl font-black text-slate-800">{aspirations.length}</p>
                 </div>
               </div>
            </div>
          </header>

          {/* --- CONTENT: ANGGOTA --- */}
          {activeTab === 'anggota' && (
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* FORM CARD (Left) */}
              <div className="lg:col-span-4 h-fit sticky top-8">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/60 border border-white">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800">Tambah Anggota</h3>
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-500">{generatedNBA}</div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Upload Area */}
                    <div className="group relative h-48 w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50/50">
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" disabled={!formData.nis} className="absolute inset-0 z-20 cursor-pointer opacity-0" />
                      {formData.foto_url ? (
                        <div className="relative h-full w-full">
                           <img src={getAdminImageUrl(formData.foto_url) || ''} className="h-full w-full object-cover" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"><p className="text-white font-bold text-xs">Ganti Foto</p></div>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-slate-400">
                          {uploading ? <Loader2 className="animate-spin text-blue-600 mb-2"/> : <Upload className="mb-2 text-slate-300 group-hover:text-blue-500 transition" size={32} />}
                          <span className="text-xs font-bold">{uploading ? 'Mengupload...' : 'Klik Upload Foto'}</span>
                          <span className="text-[10px] text-slate-400 mt-1">{!formData.nis ? '(Isi NIS Dulu)' : 'Max 2MB'}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Tahun</label>
                         <input name="tahun_lulus" value={formData.tahun_lulus} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border-none p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Kode</label>
                         <select name="kode_jabatan" value={formData.kode_jabatan} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border-none p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition">
                            <option value="01">01-Ketua</option>
                            <option value="02">02-Wakil</option>
                            <option value="03">03-Sekretaris</option>
                            <option value="04">04-Bendahara</option>
                            <option value="05">05-Sekbid</option>
                            <option value="06">06-Anggota</option>
                         </select>
                       </div>
                    </div>
                    
                    <input name="nis" value={formData.nis} onChange={handleInputChange} placeholder="NIS Siswa" className="w-full rounded-xl bg-slate-50 border-none p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition placeholder:font-normal" required />
                    <input name="nama" value={formData.nama} onChange={handleInputChange} placeholder="Nama Lengkap" className="w-full rounded-xl bg-slate-50 border-none p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition placeholder:font-normal" required />
                    <input name="nama_jabatan" value={formData.nama_jabatan} onChange={handleInputChange} placeholder="Nama Jabatan (Display)" className="w-full rounded-xl bg-slate-50 border-none p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition placeholder:font-normal" required />
                    <input name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="Kelas" className="w-full rounded-xl bg-slate-50 border-none p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition placeholder:font-normal" required />

                    <button type="submit" disabled={loading || uploading} className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Simpan Data
                    </button>
                  </form>
                </div>
              </div>

              {/* TABLE LIST (Right) */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Anggota</th>
                           <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Jabatan</th>
                           <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {members.map((m) => (
                          <tr key={m.nba} className="group hover:bg-blue-50/50 transition duration-300">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-200 overflow-hidden shadow-sm">
                                  {m.foto_url ? <img src={getAdminImageUrl(m.foto_url) || ''} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageIcon size={18}/></div>}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">{m.nama}</div>
                                  <div className="text-xs text-slate-400 font-mono mt-0.5">{m.nba}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                {m.nama_jabatan}
                              </span>
                              <div className="text-xs text-slate-400 mt-1 pl-1">{m.kelas}</div>
                            </td>
                            <td className="p-5 text-right">
                              <button onClick={() => handleDeleteMember(m.nba)} className="p-3 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTENT: ASPIRASI --- */}
          {activeTab === 'aspirasi' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {aspirations.length === 0 ? (
                 <div className="col-span-full py-20 text-center">
                   <div className="mx-auto h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4"><Inbox size={40}/></div>
                   <p className="text-slate-400 font-medium">Belum ada aspirasi masuk.</p>
                 </div>
               ) : (
                 aspirations.map((msg) => (
                   <div key={msg.id} className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                         <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/30">
                              {msg.nama ? msg.nama.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-sm">{msg.nama || 'Anonim'}</h4>
                               <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{msg.kelas || 'Siswa'}</p>
                            </div>
                         </div>
                         <span className="text-[10px] text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">
                            {new Date(msg.created_at).toLocaleDateString()}
                         </span>
                      </div>
                      
                      <div className="relative bg-slate-50 rounded-2xl p-4 mb-2 group-hover:bg-blue-50/50 transition-colors">
                        <MessageSquare size={16} className="absolute -top-2 -left-2 text-blue-500 bg-white rounded-full p-0.5 shadow-sm" />
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{msg.pesan}"</p>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteAspiration(msg.id)} className="p-2 bg-white text-red-400 hover:text-red-600 rounded-xl shadow-sm hover:shadow-md border border-slate-100">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}