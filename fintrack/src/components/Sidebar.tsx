import React from 'react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  userName: string;
  userRole?: string;
  userAvatar?: string | null;
  onLogout: () => void;
  isDarkMode: boolean;       // <-- Tambahan Prop Dark Mode
  toggleDarkMode: () => void; // <-- Tambahan Prop Toggle
}

const Sidebar = ({ activePage, onNavigate, userName, userRole, userAvatar, onLogout, isDarkMode, toggleDarkMode }: SidebarProps) => {
  const menus = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'atur-budget', label: 'Atur Budget' },
    { id: 'tagihan-langganan', label: 'Tagihan & Langganan' },
    { id: 'riwayat-transaksi', label: 'Riwayat Transaksi' },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/50 p-8 flex flex-col justify-between h-full transition-colors duration-300 z-10">
      <div>
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-8 h-8 bg-[#A844FF] rounded-lg flex items-center justify-center text-white font-bold italic">F</div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white transition-colors duration-300">FinTrack</h1>
        </div>
        
        <nav className="space-y-3">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => onNavigate(menu.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activePage === menu.id 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {menu.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {/* --- TOMBOL SAKLAR DARK MODE --- */}
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-700/50"
        >
          <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-colors">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
          <span className="text-xl transition-transform hover:scale-110">{isDarkMode ? '☀️' : '🌙'}</span>
        </button>

        {/* AREA PROFIL & LOGOUT */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 transition-colors duration-300">
          <div className={`flex items-center justify-between p-2 -ml-2 rounded-2xl transition-all duration-300 ${
            activePage === 'profile' ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}>
            
            {/* Tombol ke Profile Page (Kiri) */}
            <button 
              onClick={() => onNavigate('profile')}
              className="flex items-center space-x-3 flex-1 text-left overflow-hidden"
            >
              {/* Avatar User */}
              <div className={`w-10 h-10 shrink-0 rounded-[14px] flex items-center justify-center font-black transition-colors duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 ${
                activePage === 'profile' && !userAvatar ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userName ? userName[0].toUpperCase() : 'U'
                )}
              </div>
              
              {/* Info User */}
              <div className="leading-tight overflow-hidden pr-2">
                <p className="font-black text-sm text-slate-900 dark:text-white truncate transition-colors duration-300">{userName}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 truncate transition-colors duration-300">
                  {userRole || 'Pro Engineer'}
                </p>
              </div>
            </button>

            {/* Tombol Logout (Kanan) */}
            <button 
              onClick={onLogout}
              className="p-2.5 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shrink-0"
              title="Keluar Akun"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;