import React from 'react';

function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 flex items-center justify-between px-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"></div>
            ))}
          </div>

          {/* Filter Tabs Skeleton */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-24 h-8 bg-slate-100 dark:bg-slate-800/50 rounded-full"></div>
            ))}
          </div>

          {/* Trips Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;

