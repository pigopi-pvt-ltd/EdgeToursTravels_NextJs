function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)] transition-colors">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-0">
          <div className="bg-white dark:bg-slate-900 py-6 md:py-12 transition-colors min-h-[calc(100vh-112px)]">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-[#f8fafc] dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
