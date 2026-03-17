import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const AddTransactionModal = ({ isOpen, onClose, onSave, initialData }: ModalProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makanan dan Minuman');
  const [group, setGroup] = useState('Needs');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category || 'Makanan dan Minuman');
      setGroup(initialData.group);
      setDescription(initialData.description || initialData.note || '');
    } else if (isOpen) {
      setType('expense');
      setAmount('');
      setDescription('');
      setError('');
      setCategory('Makanan dan Minuman');
      setGroup('Needs');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!initialData && isOpen) {
      if (type === 'income') {
        setCategory('Pendapatan');
        setGroup('Main Account');
      } else {
        setCategory('Makanan dan Minuman');
        setGroup('Needs');
      }
    }
  }, [type, initialData, isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmount(rawValue);
  };

  const handleSave = () => {
    const numericAmount = parseInt(amount) || 0;
    
    if (numericAmount <= 0 || !description.trim()) {
      setError('Nominal dan deskripsi tidak boleh kosong!');
      return;
    }

    onSave({
      type,
      amount: numericAmount,
      category,
      group,
      description,
      date: initialData ? initialData.date : new Date().toLocaleDateString('id-ID'),
    });
    
    window.dispatchEvent(new CustomEvent('fintrack-toast', { 
      detail: { msg: 'Transaksi berhasil disimpan! 🎉', type: 'success' } 
    }));
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors"
          >
            <div className="p-8 pb-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-white dark:bg-[#0F172A] transition-colors">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                  {initialData ? 'Edit Transaksi' : 'Catat Transaksi'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Pemasukan / Pengeluaran
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[14px] flex items-center justify-center transition-all font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-6 bg-white dark:bg-[#0F172A] transition-colors">
              <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-[20px]">
                <button
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-[16px] transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setType('income')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-[16px] transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  Pemasukan
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 dark:text-slate-500">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={amount === '' ? '' : new Intl.NumberFormat('id-ID').format(parseInt(amount))}
                    onChange={handleAmountChange}
                    className="w-full p-5 pl-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[22px] text-2xl font-black text-[#3b82f6] outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[22px] text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 outline-none cursor-pointer appearance-none focus:bg-white dark:focus:bg-slate-800 transition-all"
                  >
                    {type === 'expense' ? (
                      <>
                        <option>Makanan dan Minuman</option>
                        <option>Belanja</option>
                        <option>Transportasi</option>
                        <option>Investasi</option>
                      </>
                    ) : (
                      <>
                        <option>Pendapatan</option>
                        <option>Investasi</option>
                      </>
                    )}
                  </select>

                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[22px] text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 outline-none cursor-pointer appearance-none focus:bg-white dark:focus:bg-slate-800 transition-all"
                  >
                    {type === 'expense' ? (
                      <>
                        <option>Needs</option>
                        <option>Wants</option>
                        <option>Saving</option>
                      </>
                    ) : (
                      <>
                        <option>Main Account</option>
                        <option>Secondary Account</option>
                        <option>Third Account</option>
                      </>
                    )}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Deskripsi (ex: Beli Kopi)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-700/50 rounded-[22px] text-sm font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center bg-rose-50 dark:bg-rose-500/10 p-3 rounded-[14px]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={handleSave}
                className={`w-full py-5 text-white font-black rounded-[22px] text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  type === 'expense' ? 'bg-[#0F172A] hover:bg-[#A844FF] dark:bg-purple-600 dark:hover:bg-purple-500 shadow-slate-200 dark:shadow-none' : 'bg-green-500 hover:bg-green-600 shadow-green-100 dark:shadow-none'
                }`}
              >
                {initialData ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;