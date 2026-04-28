import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)] transition-colors">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"></div>
            ))}
          </div>
          <div className="h-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8"></div>
            <div className="w-full h-[250px] bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingsSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)]">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <div className="flex gap-2 mb-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0"></div>
            ))}
          </div>
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

export function VehiclesSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)]">
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

export function ProfileSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 p-2 md:p-4">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-100 dark:border-slate-800 text-center">
              <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl mx-auto mb-6"></div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-2"></div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mx-auto mb-6"></div>
              <div className="flex justify-center gap-2 mb-8">
                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              </div>
              <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-100 dark:border-slate-800">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-100 dark:border-slate-800">
                  <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j}>
                        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded mb-1"></div>
                        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-6">
                    <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                    <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
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
