import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatRupiah } from '../utils/format';

const Budget = ({ settings, goals, onRefresh }: any) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', term: '' });
  
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${localStorage.getItem('fintrack_token')}` }
  });

  useEffect(() => { setLocalSettings(settings); }, [settings]);

  const handleSaveConfig = async () => {
    try {
      await api.put('/budget', localSettings);
      onRefresh();
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Budget tersimpan di Cloud! ☁️', type: 'success' } }));
    } catch (err) { alert("Gagal update konfigurasi"); }
  };

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target || !newGoal.term) return alert("Lengkapi data goal!");
    try {
      await api.post('/goals', newGoal);
      setNewGoal({ name: '', target: '', term: '' });
      onRefresh();
    } catch (err) { alert("Gagal simpan goal"); }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm("Hapus target tabungan ini?")) {
      try {
        await api.delete(`/goals/${id}`);
        onRefresh();
      } catch (err) { alert("Gagal hapus"); }
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <header>
        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Atur Budget & Goals</h2>
        <p className="text-slate-400 font-medium">Kelola alokasi dana dan target tabungan masa depanmu.</p>
      </header>

      {/* SECTION 1: INCOME TARGET */}
      <div className="bg-slate-900 dark:bg-slate-800/80 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden transition-colors">
        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Target Pemasukan Bulanan (Cloud)</p>
        <div className="flex items-center border-b-2 border-white/20 pb-4 focus-within:border-purple-400 transition-all">
          <span className="text-3xl font-black mr-4 text-purple-400">Rp</span>
          <input 
            type="text" 
            value={new Intl.NumberFormat('id-ID').format(localSettings.monthlyIncomeTarget)}
            onChange={(e) => setLocalSettings({...localSettings, monthlyIncomeTarget: parseInt(e.target.value.replace(/\D/g, '')) || 0})}
            className="bg-transparent text-5xl font-black outline-none w-full tracking-tighter"
          />
        </div>
      </div>

      {/* SECTION 2: SLIDERS (Tetap gunakan UI existing kamu) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['needsPercentage', 'wantsPercentage', 'savingsPercentage'].map((key) => (
          <div key={key} className="bg-white dark:bg-[#0F172A] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-4">{key.replace('Percentage', '')} : {localSettings[key]}%</h4>
            <input 
              type="range" min="0" max="100" 
              value={localSettings[key]} 
              onChange={(e) => setLocalSettings({...localSettings, [key]: Number(e.target.value)})} 
              className="w-full accent-purple-600" 
            />
          </div>
        ))}
      </div>

      {/* SECTION 3: SAVING GOALS LIST */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cloud Saving Goals 🎯</h3>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[400px] bg-white dark:bg-[#0F172A] p-10 rounded-[40px] border border-slate-100 dark:border-slate-800/50 space-y-4">
             <input placeholder="Nama Goal" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl dark:text-white" />
             <input placeholder="Total Target" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value.replace(/\D/g, '')})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl dark:text-white" />
             <input placeholder="Tenor (Bulan)" type="number" value={newGoal.term} onChange={e => setNewGoal({...newGoal, term: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl dark:text-white" />
             <button onClick={handleAddGoal} className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl">Tambah Goal</button>
          </div>
          <div className="flex-1 space-y-3">
             {goals.map((goal: any) => (
               <div key={goal.id} className="bg-white dark:bg-[#0F172A] p-6 rounded-[30px] border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <div>
                    <p className="font-black dark:text-white">{goal.name}</p>
                    <p className="text-[10px] text-slate-400">{formatRupiah(goal.target)} • {goal.term} Bln</p>
                  </div>
                  <button onClick={() => handleDeleteGoal(goal.id)} className="text-rose-500 p-2">🗑️</button>
               </div>
             ))}
          </div>
        </div>
      </div>

      <button onClick={handleSaveConfig} className="w-full py-5 bg-slate-900 dark:bg-purple-600 text-white font-black rounded-[30px] uppercase tracking-widest shadow-xl">Simpan Konfigurasi ke Cloud</button>
    </div>
  );
};

export default Budget;