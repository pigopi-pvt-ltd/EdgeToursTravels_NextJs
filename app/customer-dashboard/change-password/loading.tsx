export default function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>

        <div className="p-0">
          <div className="bg-white dark:bg-slate-900 py-1 transition-colors min-h-[calc(100vh-120px)] flex items-center justify-center">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800/50 p-4 md:p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl mx-4">
              <div className="text-center mb-2">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded mx-auto mt-2"></div>
                <div className="h-1 w-8 bg-orange-200 dark:bg-orange-900 mx-auto mt-2 rounded-full"></div>
              </div>

              <div className="space-y-1.5 mt-4">
                <div className="space-y-0.5">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded ml-1 mb-1"></div>
                  <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>

                <div className="space-y-0.5">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded ml-1 mb-1"></div>
                  <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>

                <div className="space-y-0.5">
                  <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded ml-1 mb-1"></div>
                  <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>

                <div className="pt-1 mt-3">
                  <div className="w-full h-10 bg-blue-200 dark:bg-blue-900/50 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
