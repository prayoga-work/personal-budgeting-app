import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import History from './pages/History';
import Subscriptions from './pages/Subscriptions';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AddTransactionModal from './components/AddTransactionModal';
import SkeletonDashboard from './components/SkeletonDashboard';
import SkeletonHistory from './components/SkeletonHistory'; 
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('fintrack_token'));
  
  // 👇 UPDATE 1: Baca activePage terakhir dari localStorage, kalau kosong baru ke 'dashboard'
  const [activePage, setActivePage] = useState(localStorage.getItem('fintrack_active_page') || 'dashboard');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('fintrack_theme') === 'dark');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: string}>({ show: false, msg: '', type: 'success' });
  
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE DATA DARI CLOUD ---
  const [transactions, setTransactions] = useState<any[]>([]);
  const [savingGoals, setSavingGoals] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [budgetSettings, setBudgetSettings] = useState({
    monthlyIncomeTarget: 0,
    needsPercentage: 50,
    wantsPercentage: 30,
    savingsPercentage: 20
  });
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : { name: 'User', role: 'Member', avatar: null };
  });

  // 👇 UPDATE: URL Backend sekarang mengarah ke Vercel!
  const api = axios.create({
    baseURL: 'https://fintrack-backend-rho.vercel.app/api',
    headers: { Authorization: `Bearer ${localStorage.getItem('fintrack_token')}` }
  });

  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true); 
    
    try {
      const [tx, goals, bdgt, subs, me] = await Promise.all([
        api.get('/transactions').catch(() => ({ data: [] })),
        api.get('/goals').catch(() => ({ data: [] })),
        api.get('/budget').catch(() => ({ data: budgetSettings })),
        api.get('/subscriptions').catch(() => ({ data: [] })),
        api.get('/auth/me').catch(() => ({ data: profileData }))
      ]);

      setTransactions(tx.data);
      setSavingGoals(goals.data);
      setBudgetSettings(bdgt.data);
      setSubscriptions(subs.data);
      setProfileData(me.data);
      localStorage.setItem('user_data', JSON.stringify(me.data));
      
    } catch (error) {
      console.error("Gagal sinkronisasi data cloud");
    } finally {
      // Delay agar transisi smooth
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated]);

  useEffect(() => {
    const html = document.documentElement;
    isDarkMode ? html.classList.add('dark') : html.classList.remove('dark');
    localStorage.setItem('fintrack_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 👇 UPDATE 2: Simpan posisi activePage ke localStorage setiap kali pindah menu
  useEffect(() => {
    localStorage.setItem('fintrack_active_page', activePage);
  }, [activePage]);

  const handleSaveTransaction = async (data: any) => {
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, data);
      } else {
        await api.post('/transactions', data);
      }
      fetchAllData(); 
      setIsModalOpen(false);
      setEditingTransaction(null);
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Berhasil sinkron ke Cloud! ☁️', type: 'success' } }));
    } catch (error: any) { alert("Gagal simpan"); }
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm("Hapus permanen?")) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchAllData();
      } catch (err) { alert("Gagal hapus"); }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi?")) {
      localStorage.clear();
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleToast = (e: any) => {
      setToast({ show: true, msg: e.detail.msg, type: e.detail.type });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
    };
    window.addEventListener('fintrack-toast', handleToast);
    return () => window.removeEventListener('fintrack-toast', handleToast);
  }, []);

  return (
    <>
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999]">
            <div className={`px-6 py-4 rounded-[20px] shadow-2xl border flex items-center space-x-3 text-white backdrop-blur-md ${toast.type === 'error' ? 'bg-rose-500/90 border-rose-400' : toast.type === 'info' ? 'bg-blue-600/90 border-blue-500' : 'bg-[#0F172A]/90 border-slate-700'}`}>
              <span>{toast.type === 'error' ? '🚨' : toast.type === 'info' ? '💡' : '✅'}</span>
              <p className="text-xs font-black uppercase tracking-widest">{toast.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated ? (
        <Auth onLoginSuccess={() => { setIsAuthenticated(true); window.location.reload(); }} />
      ) : (
        <div className="h-screen w-full flex bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden transition-colors duration-300 relative font-sans">
          <Sidebar activePage={activePage} onNavigate={setActivePage} userName={profileData.name} userRole={profileData.role || 'Pro Engineer'} userAvatar={profileData.avatar} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
          <main className="flex-1 overflow-y-auto p-10 relative">
            
            {/* 1. DASHBOARD WITH SKELETON */}
            {activePage === 'dashboard' && (
              isLoading ? (
                <SkeletonDashboard />
              ) : (
                <Dashboard 
                  allTransactions={transactions} 
                  budgetSettings={budgetSettings} 
                  savingGoals={savingGoals} 
                  subscriptions={subscriptions} 
                  onNavigate={setActivePage} 
                />
              )
            )}

            {activePage === 'atur-budget' && <Budget settings={budgetSettings} goals={savingGoals} onRefresh={fetchAllData} />}
            
            {/* 2. HISTORY WITH SKELETON (INTEGRATED) */}
            {activePage === 'riwayat-transaksi' && (
              isLoading ? (
                <SkeletonHistory />
              ) : (
                <History 
                  transactions={transactions} 
                  onDelete={deleteTransaction} 
                  onEdit={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} 
                />
              )
            )}

            {activePage === 'tagihan-langganan' && <Subscriptions subscriptions={subscriptions} onRefresh={fetchAllData} />}
            {activePage === 'profile' && <Profile transactions={transactions} subscriptions={subscriptions} savingGoals={savingGoals} onRefreshData={fetchAllData} />}

            <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="fixed bottom-10 right-10 w-16 h-16 bg-[#0F172A] dark:bg-[#A844FF] text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6" /></svg>
            </button>
            <AddTransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} onSave={handleSaveTransaction} initialData={editingTransaction} />
          </main>
        </div>
      )}
    </>
  );
}

export default App;