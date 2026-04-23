import React from 'react';

function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 flex items-center justify-between px-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-0 space-y-0">
          {/* Section 1: Personal & Vehicle */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800/50 h-11 border-b border-slate-200 dark:border-slate-700 flex items-center px-6">
              <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800/50 h-11 border-b border-slate-200 dark:border-slate-700 flex items-center px-6">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="p-6 space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2 w-28 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-20 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Uploads */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800/50 h-11 border-b border-slate-200 dark:border-slate-700 flex items-center px-6">
              <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-lg"></div>
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

