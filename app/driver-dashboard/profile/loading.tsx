import React from 'react';

function Loading() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar Skeleton */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 flex items-center justify-between px-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="p-0">
          {/* Section Header Skeleton */}
          <div className="bg-slate-50 dark:bg-slate-800/50 h-11 border-b border-slate-200 dark:border-slate-700 flex items-center px-6">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Skeleton */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-inner flex-shrink-0"></div>
            
            {/* Form Fields Skeleton */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-6 w-full max-w-xs bg-slate-100 dark:bg-slate-800/50 rounded"></div>
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

