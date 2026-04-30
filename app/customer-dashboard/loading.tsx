function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors font-sf">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          {/* Welcome Section Skeleton */}
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full"></div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"></div>
            ))}
          </div>

          {/* Chart Section Skeleton */}
          <div className="h-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8"></div>
            <div className="w-full h-[250px] bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
