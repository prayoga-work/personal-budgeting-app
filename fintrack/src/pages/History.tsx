import { useState } from 'react';
import { formatRupiah } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jsPDF';
import autoTable from 'jspdf-autotable';

interface HistoryProps {
  transactions: any[];
  onDelete: (id: number) => void;
  onEdit: (data: any) => void;
}

const History = ({ transactions, onDelete, onEdit }: HistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState<number>(30);

  const parseDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('/')) return new Date();
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = parseDate(t.date);
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
    const isWithinDate = diffDays <= filterDays;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (t.description || '').toLowerCase().includes(searchLower) || 
      (t.category || '').toLowerCase().includes(searchLower);

    return isWithinDate && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = parseDate(a.date).getTime();
    const dateB = parseDate(b.date).getTime();
    if (dateA === dateB) return b.id - a.id;
    return dateB - dateA;
  });

  const groupedTransactions: { date: string; items: any[] }[] = [];
  
  sortedTransactions.forEach(t => {
    const validDate = parseDate(t.date);
    const dateStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(validDate);
    const lastGroup = groupedTransactions[groupedTransactions.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.items.push(t);
    } else {
      groupedTransactions.push({ date: dateStr, items: [t] });
    }
  });

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const dateNow = new Date().toLocaleDateString('id-ID');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('FinTrack - Financial Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Periode: ${filterDays} Hari Terakhir`, 14, 28);
      if (searchTerm) doc.text(`Filter Pencarian: "${searchTerm}"`, 14, 34);
      doc.text(`Dicetak pada: ${dateNow}`, 14, 40);

      const tableRows = sortedTransactions.map(t => [
        String(t.date),
        `${t.description || '-'} (${t.group})`,
        String(t.category),
        t.type === 'income' ? `+ ${formatRupiah(t.amount)}` : `- ${formatRupiah(t.amount)}`
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Tanggal', 'Keterangan', 'Kategori', 'Nominal']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], halign: 'center' },
        styles: { fontSize: 9 },
        columnStyles: { 3: { halign: 'right' } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            const val = String(data.cell.raw);
            data.cell.styles.textColor = val.includes('+') ? [34, 197, 94] : [244, 63, 94];
          }
        }
      });

      doc.save(`FinTrack_Report_${searchTerm || 'All'}.pdf`);
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Laporan PDF berhasil diunduh! 📄', type: 'success' } }));
    } catch (err) { 
      window.dispatchEvent(new CustomEvent('fintrack-toast', { detail: { msg: 'Gagal membuat PDF.', type: 'error' } }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Riwayat Transaksi</h2>
          <p className="text-slate-400 font-medium mt-1">Cari dan kelola mutasi keuanganmu.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari deskripsi / kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs outline-none shadow-sm focus:border-purple-600 dark:focus:border-purple-500 transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select 
              value={filterDays}
              onChange={(e) => setFilterDays(Number(e.target.value))}
              className="flex-1 md:flex-none bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 px-5 py-3.5 rounded-2xl font-black text-xs text-slate-600 dark:text-slate-300 outline-none shadow-sm focus:border-purple-600 transition-all cursor-pointer"
            >
              <option value={7}>7 Hari</option>
              <option value={30}>30 Hari</option>
              <option value={90}>90 Hari</option>
            </select>

            <button 
              onClick={generatePDF}
              disabled={filteredTransactions.length === 0}
              className="flex-1 md:flex-none px-6 py-3.5 bg-slate-900 dark:bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#A844FF] dark:hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cetak PDF
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-[#0F172A] rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden min-h-[500px] transition-colors">
        {groupedTransactions.length > 0 ? (
          <div className="p-2 sm:p-8">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 pb-4 border-b border-slate-50 dark:border-slate-800/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">
              <div className="col-span-6">Detail</div>
              <div className="col-span-4 text-right">Nominal</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            <div className="space-y-6 mt-6">
              <AnimatePresence>
                {groupedTransactions.map((group, groupIndex) => (
                  <motion.div key={group.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIndex * 0.1 }} className="space-y-2">
                    
                    <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl inline-block mb-2 ml-2 md:ml-6 border border-slate-100 dark:border-slate-700/50 transition-colors">
                      <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 tracking-wider">
                        {group.date}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {group.items.map((t) => (
                        <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-5 rounded-[24px] hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group/row items-center border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
                          
                          <div className="md:col-span-6 flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-xl shadow-inner ${t.type === 'expense' ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-green-50 dark:bg-green-500/10'}`}>
                              {t.type === 'expense' ? '💸' : '💰'}
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                {t.description || t.note || '-'}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {t.group} • {t.category}
                              </p>
                            </div>
                          </div>

                          <div className="md:col-span-4 text-left md:text-right">
                            <p className={`text-lg font-black ${t.type === 'expense' ? 'text-rose-500' : 'text-green-500'}`}>
                              {t.type === 'expense' ? '- ' : '+ '}
                              {formatRupiah(t.amount)}
                            </p>
                          </div>

                          <div className="md:col-span-2 flex items-center justify-end space-x-2 md:opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(t)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-[14px] hover:text-[#3b82f6] dark:hover:text-blue-400 hover:border-[#3b82f6] dark:hover:border-blue-400 transition-all shadow-sm" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => { if(window.confirm('Yakin ingin menghapus transaksi ini?')) onDelete(t.id); }} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-[14px] hover:text-rose-500 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm" title="Hapus">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
             <span className="text-6xl">📭</span>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
               {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Belum ada transaksi"}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;