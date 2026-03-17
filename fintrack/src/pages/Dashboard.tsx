import { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { formatRupiah } from '../utils/format';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { Plugin } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface DashboardProps {
  allTransactions: any[];
  budgetSettings: {
    monthlyIncomeTarget: number;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
  };
  savingGoals: any[];
  subscriptions: any[];
  onNavigate: (page: string) => void;
}

const Dashboard = ({ 
  allTransactions = [], 
  budgetSettings, 
  savingGoals = [], 
  subscriptions = [], 
  onNavigate 
}: DashboardProps) => {
  
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const firstName = user.name.split(' ')[0];
      setUserName(firstName);
    }
  }, []);

  // --- 1. LOGIKA PERHITUNGAN REAL-TIME (CLOUD DATA) ---
  
  // A. Perhitungan Global (Seluruh Waktu)
  const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const mainBalance = totalIncome - totalExpense;

  // B. Perhitungan Spesifik Bulan Ini (Audit Budget)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTx = allTransactions.filter(t => {
    if (!t.date || !t.date.includes('/')) return false;
    const [day, month, year] = t.date.split('/').map(Number);
    return (month - 1) === currentMonth && year === currentYear;
  });

  const monthlyExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  // C. Aktual Pengeluaran Berdasarkan Grup (Bulan Ini)
  const actualNeeds = thisMonthTx.filter(t => t.type === 'expense' && t.group === 'Needs').reduce((sum, t) => sum + t.amount, 0);
  const actualWants = thisMonthTx.filter(t => t.type === 'expense' && t.group === 'Wants').reduce((sum, t) => sum + t.amount, 0);
  const actualSaving = thisMonthTx.filter(t => t.type === 'expense' && t.group === 'Saving').reduce((sum, t) => sum + t.amount, 0);

  // D. Target Nominal dari Cloud Budget Settings
  const targetNeeds = (budgetSettings.needsPercentage / 100) * budgetSettings.monthlyIncomeTarget;
  const targetWants = (budgetSettings.wantsPercentage / 100) * budgetSettings.monthlyIncomeTarget;
  const targetSaving = (budgetSettings.savingsPercentage / 100) * budgetSettings.monthlyIncomeTarget;

  const totalUnpaidSubs = subscriptions.filter(s => !s.isPaid).reduce((sum, s) => sum + s.amount, 0);

  // --- 2. CONFIG CHART DATA ---
  const barData = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [{
      data: [totalIncome, totalExpense],
      backgroundColor: ['#22c55e', '#f43f5e'],
      borderRadius: 12,
      barThickness: 45,
    }],
  };

  const doughnutData = {
    labels: ['Needs', 'Wants', 'Saving'],
    datasets: [{
      data: [actualNeeds || 1, actualWants || 1, actualSaving || 1], // fallback 1 agar chart tidak hilang
      backgroundColor: ['#f43f5e', '#22c55e', '#3b82f6'],
      borderWidth: 0,
      hoverOffset: 15,
      cutout: '75%',
    }],
  };

  const centerTextPlugin: Plugin<'doughnut'> = {
    id: 'centerText',
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      ctx.restore();
      const isDark = document.documentElement.classList.contains('dark');
      
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Keluar Bulan Ini", Math.round((width - ctx.measureText("Keluar Bulan Ini").width) / 2), height / 2 - 15);
      
      ctx.font = "900 16px Inter, sans-serif";
      ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      const val = formatRupiah(monthlyExpense);
      ctx.fillText(val, Math.round((width - ctx.measureText(val).width) / 2), height / 2 + 15);
      ctx.save();
    }
  };

  // Helper UI
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('enter')) return '🎬';
    if (c.includes('util') || c.includes('listrik')) return '⚡';
    if (c.includes('cicil') || c.includes('bayar')) return '💳';
    if (c.includes('gym')) return '💪';
    if (c.includes('rumah') || c.includes('kos')) return '🏠';
    return '📄';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Financial Insights</h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1">Halo {userName}, targetmu bulan ini {formatRupiah(budgetSettings.monthlyIncomeTarget)}</p>
        </div>
        <button onClick={() => onNavigate('atur-budget')} className="text-[10px] font-black py-3 px-6 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-2xl hover:bg-purple-600 hover:text-white transition-all uppercase tracking-widest shadow-sm">
          Update Budget Cloud
        </button>
      </header>

      {/* ROW 1: CASHFLOW & BALANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm h-[400px] flex flex-col transition-colors">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Visualisasi Arus Kas (All Time)</h4>
          <div className="flex-1 relative">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: document.documentElement.classList.contains('dark') ? '#1e293b' : '#e2e8f0' } }, x: { grid: { display: false } } } }} />
          </div>
        </div>

        <div className="bg-[#0F172A] dark:bg-[#1E293B] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group transition-colors">
          <div className="relative z-10">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Main Credit Balance</p>
            <h3 className="text-5xl font-black tracking-tighter group-hover:text-purple-400 transition-colors duration-500">{formatRupiah(mainBalance)}</h3>
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
            <div>
               <p className="text-[10px] font-bold opacity-60 uppercase">Menunggu Tagihan:</p>
               <p className="text-[9px] opacity-40 italic">Unpaid Subscriptions</p>
            </div>
            <p className={`text-sm font-black transition-all ${totalUnpaidSubs > 0 ? 'text-rose-400' : 'text-green-400'}`}>
              {formatRupiah(totalUnpaidSubs)}
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/40 transition-all duration-700"></div>
        </div>
      </div>

      {/* ROW 2: DETAIL BUDGET PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-[#0F172A] p-10 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm h-[480px] flex flex-col transition-colors">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center">Actual Spending Mix</h4>
          <div className="flex-1 relative">
            {monthlyExpense > 0 ? (
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} plugins={[centerTextPlugin]} />
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 font-bold italic text-sm text-center p-8 transition-colors">Belum ada transaksi bulan ini.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-10 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Audit Limit Budget (Bulan Ini)</h4>
          <div className="space-y-4">
            {[
              { label: 'Needs', val: actualNeeds, target: targetNeeds, color: 'bg-rose-500', percent: budgetSettings.needsPercentage },
              { label: 'Wants', val: actualWants, target: targetWants, color: 'bg-green-500', percent: budgetSettings.wantsPercentage },
              { label: 'Saving', val: actualSaving, target: targetSaving, color: 'bg-blue-500', percent: budgetSettings.savingsPercentage },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[30px] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group/item">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.label} ({item.percent}%)</p>
                  </div>
                  <p className="text-[10px] font-black text-slate-400">LIMIT: {formatRupiah(item.target)}</p>
                </div>
                <div className="w-full h-3 bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner transition-colors">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((item.val / (item.target || 1)) * 100, 100)}%` }}
                    className={`${item.color} h-full transition-all duration-1000 shadow-lg`}
                  />
                </div>
                <div className="flex justify-between mt-2 px-1">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Aktual: {formatRupiah(item.val)}</p>
                    <p className={`text-[10px] font-black uppercase ${item.val > item.target ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                        {item.val > item.target ? '⚠️ Over Budget!' : `Sisa Aman: ${formatRupiah(item.target - item.val)}`}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: TAGIHAN & GOALS (Gunakan Logic Cloud Existing) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Upcoming Bills */}
          <div className="space-y-4">
             <h4 className="text-xl font-black text-slate-900 dark:text-white px-2">Tagihan Terdekat</h4>
             <div className="space-y-3">
                {subscriptions.filter(s => !s.isPaid).slice(0, 3).map(bill => (
                    <div key={bill.id} className="bg-white dark:bg-[#0F172A] p-5 rounded-[28px] border border-slate-100 dark:border-slate-800/50 shadow-sm flex items-center justify-between group hover:border-purple-300 transition-all">
                       <div className="flex items-center space-x-4">
                          <span className="text-2xl">{getCategoryIcon(bill.category)}</span>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{bill.name}</p>
                            <p className="text-[9px] font-black uppercase text-slate-400">TGL {bill.dueDate}</p>
                          </div>
                       </div>
                       <p className="text-sm font-black text-[#3b82f6]">{formatRupiah(bill.amount)}</p>
                    </div>
                ))}
                {subscriptions.filter(s => !s.isPaid).length === 0 && <p className="text-xs text-slate-400 italic px-2">Tidak ada tagihan tertunda.</p>}
             </div>
          </div>

          {/* Saving Goals Mini */}
          <div className="space-y-4">
             <h4 className="text-xl font-black text-slate-900 dark:text-white px-2">Saving Goals</h4>
             <div className="space-y-3">
                {savingGoals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="bg-white dark:bg-[#0F172A] p-5 rounded-[28px] border border-slate-100 dark:border-slate-800/50 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">🎯</div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{goal.name}</p>
                            <p className="text-[9px] font-black uppercase text-slate-400">Target: {formatRupiah(goal.target)}</p>
                          </div>
                       </div>
                       <p className="text-sm font-black text-green-500">{goal.term} Bln</p>
                    </div>
                ))}
                {savingGoals.length === 0 && <p className="text-xs text-slate-400 italic px-2">Belum ada target tabungan.</p>}
             </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;