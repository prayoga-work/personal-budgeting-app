import { useState } from 'react';
import axios from 'axios';
import { formatRupiah } from '../utils/format';

const Subscriptions = ({ subscriptions, onRefresh }: any) => {
  const [newSub, setNewSub] = useState({ name: '', amount: '', dueDate: '', category: 'Entertainment' });
  
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${localStorage.getItem('fintrack_token')}` }
  });

  const handleAdd = async () => {
    if (!newSub.name || !newSub.amount || !newSub.dueDate) return alert("Lengkapi data!");
    try {
      await api.post('/subscriptions', newSub);
      setNewSub({ name: '', amount: '', dueDate: '', category: 'Entertainment' });
      onRefresh();
    } catch (err) { alert("Gagal simpan"); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.put(`/subscriptions/${id}/toggle`);
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus tagihan?")) {
      try {
        await api.delete(`/subscriptions/${id}`);
        onRefresh();
      } catch (err) { alert("Gagal hapus"); }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <h2 className="text-3xl font-black dark:text-white">Cloud Subscriptions 📅</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] p-8 rounded-[32px] border border-slate-100 dark:border-slate-800/50 space-y-4">
           <input placeholder="Nama Tagihan" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl dark:text-white" />
           <input placeholder="Nominal" value={newSub.amount} onChange={e => setNewSub({...newSub, amount: e.target.value.replace(/\D/g, '')})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl dark:text-white" />
           <input type="number" placeholder="Tgl Jatuh Tempo" value={newSub.dueDate} onChange={e => setNewSub({...newSub, dueDate: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl dark:text-white" />
           <button onClick={handleAdd} className="w-full py-4 bg-[#A844FF] text-white font-black rounded-xl uppercase tracking-widest">Daftarkan Cloud</button>
        </div>

        <div className="lg:col-span-8 space-y-3 overflow-y-auto" style={{ maxHeight: '460px' }}>
          {subscriptions.map((sub: any) => (
            <div key={sub.id} className={`bg-white dark:bg-[#0F172A] p-6 rounded-[28px] border border-slate-100 dark:border-slate-800/50 flex justify-between items-center transition-all ${sub.isPaid ? 'opacity-50' : ''}`}>
               <div>
                  <p className="text-lg font-black dark:text-white">{sub.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{formatRupiah(sub.amount)} • TGL {sub.dueDate}</p>
               </div>
               <div className="flex space-x-2">
                  <button onClick={() => handleToggle(sub.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub.isPaid ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>✓</button>
                  <button onClick={() => handleDelete(sub.id)} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl text-rose-500">🗑️</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;