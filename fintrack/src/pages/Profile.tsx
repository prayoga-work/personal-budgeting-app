import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Terima prop onRefreshData untuk mengupdate state global App.tsx
interface ProfileProps {
  transactions: any[];
  subscriptions: any[];
  savingGoals: any[];
  onRefreshData: () => Promise<void>; 
}

const Profile = ({ transactions, subscriptions, savingGoals, onRefreshData }: ProfileProps) => {
  // --- 1. STATE AWAL (DATA DIAMBIL VIA FETCH) ---
  const [profile, setProfile] = useState<any>({ name: '', role: '', email: '', phone: '', avatar: null });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk form keamanan (kata sandi)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Helper Axios Instance
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${localStorage.getItem('fintrack_token')}` }
  });

  // --- 2. AMBIL DATA DARI CLOUD SAAT MOUNT HALAMAN ---
  useEffect(() => {
    const fetchCloudProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data);
      } catch (err) {
        console.error("Gagal mengambil profil cloud");
      } finally {
        setLoading(false);
      }
    };
    fetchCloudProfile();
  }, []);

  // --- 3. HANDLER SIMPAN PROFIL KE CLOUD ---
  const handleSaveProfileToCloud = async () => {
    if (!profile.name) {
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Nama wajib diisi!', type: 'error' } }));
      return;
    }
    
    setIsSaving(true);
    try {
      // Kirim data ke API Backend (termasuk Base64 foto)
      const res = await api.put('/auth/profile', {
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        avatar: profile.avatar
      });

      // Update state data global di App.tsx agar Sidebar/Header langsung sinkron
      await onRefreshData();

      window.dispatchEvent(new CustomEvent('fintrack-toast', { 
        detail: { msg: 'Profil Sinkron ke Cloud! ☁️', type: 'success' } 
      }));
    } catch (err: any) {
      // Tangkap jika payload terlalu besar (Express JSON limit error)
      const msg = err.response?.status === 413 ? "Ukuran foto terlalu besar!" : "Gagal sinkronisasi profil";
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg, type: 'error' } }));
    } finally {
      setIsSaving(false);
    }
  };

  // Handler konversi foto ke string Base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran foto (misal 2MB)
    if (file.size > 2 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Ukuran foto maksimal 2MB!', type: 'error' } }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setProfile({ ...profile, avatar: base64String });
      // Beri notifikasi foto berubah secara visual
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Foto profil diperbarui! 📸', type: 'info' } }));
    };
    reader.readAsDataURL(file);
  };

  // Handler Keamanan (Kata Sandi) - Code Existing Kamu
  const handleSavePassword = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Lengkapi form password!', type: 'error' } }));
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Password baru tidak cocok!', type: 'error' } }));
      return;
    }
    setPasswordForm({ current: '', new: '', confirm: '' });
    window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Fitur belum diimplementasikan di Backend!', type: 'info' } }));
  };

  // Handler Reset App (Masih pakai localStorage, mungkin mau diubah ke Cloud nanti?)
  const handleResetApp = () => {
    if (window.confirm("PERINGATAN! Semua data lokal dan sesi login akan dihapus. Lanjutkan?")) {
      localStorage.clear();
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Aplikasi di-reset. Keluar...', type: 'info' } }));
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // Loading State saat halaman dibuka
  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-400 dark:text-slate-600 tracking-widest text-2xl">SYNCING CLOUD PROFILE...</div>;

  return (
    <div className="space-y-8 animate-fadeIn pb-20 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Profile & Settings</h2>
          <span className="text-3xl">⚙️</span>
        </div>
        
        {/* 👇 Tombol Save Utama di Kanan Atas */}
        <button 
          onClick={handleSaveProfileToCloud} 
          disabled={isSaving}
          className="px-8 py-4 bg-[#A844FF] text-white font-black rounded-[20px] text-[10px] uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-purple-600 transition-all shadow-xl shadow-purple-100 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan ke Cloud'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* KOLOM KIRI: AVATAR & INSIGHTS (Existing Style) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden transition-colors">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="w-24 h-24 bg-slate-900 text-white rounded-[30px] flex items-center justify-center text-4xl font-black mb-4 shadow-xl relative z-10 cursor-pointer group overflow-hidden border-4 border-white dark:border-[#0F172A] transition-all hover:scale-105"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name?.charAt(0).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />

            <h3 className="text-2xl font-black text-slate-900 dark:text-white relative z-10 transition-colors">{profile.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">{profile.role}</p>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-[40px]"></div>
          </div>

          {/* INSIGHTS AREA (Existing Code) */}
          <div className="bg-[#0F172A] dark:bg-slate-800/80 p-8 rounded-[35px] text-white shadow-xl space-y-6 transition-colors">
            <h4 className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em]">App Insights (Cloud Data)</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold opacity-70">Total Transaksi</span>
                <span className="text-lg font-black text-blue-400">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold opacity-70">Tagihan Aktif</span>
                <span className="text-lg font-black text-rose-400">{subscriptions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold opacity-70">Saving Goals</span>
                <span className="text-lg font-black text-green-400">{savingGoals.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: FORM EDIT (Existing Style dengan Logika Cloud) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[#0F172A] p-10 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm space-y-6 transition-colors">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informasi Pribadi Cloud ☁️</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nama Lengkap</label>
                <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[20px] text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-purple-100 dark:focus:border-purple-500/20 transition-all dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Title / Pekerjaan</label>
                <input value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[20px] text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-purple-100 dark:focus:border-purple-500/20 transition-all dark:text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Alamat Email (Permanen)</label>
                <input type="email" value={profile.email} disabled className="w-full p-4 bg-slate-100 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-[20px] text-sm font-bold outline-none opacity-60 cursor-not-allowed dark:text-slate-400" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nomor Handphone</label>
                <input type="tel" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[20px] text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-purple-100 dark:focus:border-purple-500/20 transition-all dark:text-white" />
              </div>
            </div>
          </div>

          {/* KEAMANAN AKUN (Existing Code) */}
          <div className="bg-white dark:bg-[#0F172A] p-10 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm space-y-6 transition-colors">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Keamanan Akun (Hanya Simulasi)</h4>
            <div className="space-y-5">
              <input type="password" placeholder="Password Saat Ini" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[20px] text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="password" placeholder="Password Baru" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[20px] text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white" />
                <input type="password" placeholder="Ulangi Password Baru" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[20px] text-sm font-bold outline-none focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <button onClick={() => window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Reset via Email belum ada API backend!', type: 'info' } }))} className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest hover:underline">Lupa Password?</button>
                <button onClick={handleSavePassword} className="px-8 py-4 bg-slate-900 dark:bg-[#A844FF] text-white font-black rounded-[20px] text-[10px] uppercase tracking-widest hover:bg-[#A844FF] dark:hover:bg-purple-600 transition-all shadow-xl active:scale-95">Update Password</button>
              </div>
            </div>
          </div>

          {/* DANGER ZONE (Hanya Reset App Lokal) */}
          <div className="bg-rose-50 dark:bg-rose-500/10 p-8 rounded-[35px] border border-rose-100 dark:border-rose-500/20 shadow-sm space-y-5 transition-colors">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Danger Zone</h4>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-medium text-rose-700/70 dark:text-rose-400/70">Menghapus data sesi lokal (bukan database cloud) dan keluar aplikasi.</p>
              <button onClick={handleResetApp} className="flex-shrink-0 px-6 py-4 bg-white dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/30 font-black rounded-[18px] text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                🚨 Reset Aplikasi
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;