function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
