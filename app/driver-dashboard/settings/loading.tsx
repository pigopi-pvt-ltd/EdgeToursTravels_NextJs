import React from 'react';

function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 flex items-center justify-between px-6">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>

        <div className="p-0 space-y-0">
          {[...Array(2)].map((_, sectionIdx) => (
            <div key={sectionIdx} className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-800/50 h-11 border-b border-slate-200 dark:border-slate-700 flex items-center px-6">
                <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...Array(sectionIdx === 0 ? 2 : 1)].map((_, itemIdx) => (
                  <div key={itemIdx} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Loading;

