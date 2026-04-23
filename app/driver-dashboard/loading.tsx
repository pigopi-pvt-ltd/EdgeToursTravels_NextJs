import React from 'react';

function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"></div>
        ))}
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-8 bg-slate-100 dark:bg-slate-800/50 rounded-full"></div>
          ))}
        </div>
        <div className="w-24 h-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
      </div>

      {/* Trips Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-56 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700"></div>
        ))}
      </div>
    </div>
  );
}

export default Loading;

