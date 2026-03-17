const SkeletonDashboard = () => {
  return (
    <div className="space-y-8 animate-pulse pb-20">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
        </div>
        <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>

      {/* Row 1: Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px]"></div>
        <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-[40px]"></div>
      </div>

      {/* Row 2: Analysis Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[480px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px]"></div>
        <div className="lg:col-span-2 h-[480px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px]"></div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;