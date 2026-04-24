function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Filter Skeleton */}
          <div className="flex gap-2 mb-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0"></div>
            ))}
          </div>

          {/* Booking Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
