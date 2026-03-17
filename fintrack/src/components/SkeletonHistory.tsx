// src/components/SkeletonHistory.tsx
const SkeletonHistory = () => {
  return (
    <div className="space-y-6 animate-pulse pb-20">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
      </div>

      {/* List Transaksi Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div 
            key={item} 
            className="p-6 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/50 rounded-[30px] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Icon Box */}
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-[18px]"></div>
              
              {/* Text Lines */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-md"></div>
              </div>
            </div>

            {/* Amount Pill */}
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonHistory;