function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-6 md:p-12">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>

            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Avatar Skeleton */}
              <div className="w-40 h-40 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>

              {/* Profile Details Skeleton */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
