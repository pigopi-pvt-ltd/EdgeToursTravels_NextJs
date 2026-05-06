import React from 'react';

/**
 * Standard Header Toolbar Skeleton
 */
function HeaderSkeleton({ titleWidth = "w-48" }) {
  return (
    <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
      <div className={`h-6 ${titleWidth} shimmer rounded-md`}></div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 shimmer rounded-lg"></div>
        <div className="h-9 w-9 shimmer rounded-full"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <HeaderSkeleton titleWidth="w-40" />
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-32 relative overflow-hidden">
                <div className="h-3 w-20 shimmer rounded mb-4"></div>
                <div className="h-10 w-12 shimmer rounded"></div>
                <div className="absolute right-5 top-5 h-10 w-10 shimmer rounded-xl"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 h-[400px] overflow-hidden">
              <div className="h-4 w-32 shimmer rounded mb-8"></div>
              <div className="w-full h-64 shimmer rounded-xl opacity-50"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 h-[400px] space-y-4 overflow-hidden">
              <div className="flex justify-between mb-6">
                <div className="h-4 w-32 shimmer rounded"></div>
                <div className="h-3 w-16 shimmer rounded"></div>
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 w-full shimmer rounded-2xl opacity-40"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingsSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <HeaderSkeleton titleWidth="w-32" />
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 h-24 overflow-hidden">
                <div className="h-3 w-12 shimmer rounded mb-2"></div>
                <div className="h-8 w-10 shimmer rounded"></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-20 shimmer rounded-full"></div>)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6 space-y-4 overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-64 shimmer rounded"></div>
                    <div className="flex gap-4">
                      <div className="h-4 w-24 shimmer rounded"></div>
                      <div className="h-4 w-24 shimmer rounded"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="h-6 w-20 shimmer rounded-full"></div>
                    <div className="h-4 w-24 shimmer rounded"></div>
                  </div>
                </div>
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
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <HeaderSkeleton titleWidth="w-40" />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex gap-2 mb-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-20 shimmer rounded-full"></div>)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3 overflow-hidden">
                <div className="absolute top-2 right-2 h-4 w-16 shimmer rounded-full"></div>
                <div className="w-9 h-9 rounded-lg shimmer"></div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 shimmer rounded"></div>
                  <div className="h-3 w-1/2 shimmer rounded"></div>
                </div>
                <hr className="border-slate-100 dark:border-slate-700" />
                <div className="flex justify-between">
                  <div className="space-y-1"><div className="h-2 w-8 shimmer rounded"></div><div className="h-3 w-10 shimmer rounded"></div></div>
                  <div className="space-y-1"><div className="h-2 w-8 shimmer rounded"></div><div className="h-3 w-10 shimmer rounded"></div></div>
                  <div className="space-y-1"><div className="h-2 w-8 shimmer rounded"></div><div className="h-3 w-10 shimmer rounded"></div></div>
                </div>
                <div className="h-9 w-full shimmer rounded-lg"></div>
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
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 p-4">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-100 dark:border-slate-800 text-center overflow-hidden">
              <div className="w-32 h-32 shimmer rounded-3xl mx-auto mb-6"></div>
              <div className="h-8 w-48 shimmer rounded-lg mx-auto mb-2"></div>
              <div className="h-4 w-32 shimmer rounded mx-auto mb-6"></div>
              <div className="w-full h-12 shimmer rounded-2xl"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-100 dark:border-slate-800 h-64 overflow-hidden">
              <div className="h-4 w-32 shimmer rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 shimmer rounded-2xl opacity-40"></div>)}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => <div key={i} className="bg-white dark:bg-slate-900 rounded-lg h-48 border border-slate-100 dark:border-slate-800 overflow-hidden p-6">
                <div className="h-6 w-32 shimmer rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(j => <div key={j} className="h-4 w-full shimmer rounded opacity-30"></div>)}
                </div>
              </div>)}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg h-80 border border-slate-100 dark:border-slate-800 p-8 overflow-hidden">
              <div className="flex justify-between mb-8">
                <div className="h-8 w-48 shimmer rounded"></div>
                <div className="h-6 w-20 shimmer rounded-lg"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6"><div className="h-20 shimmer rounded-xl opacity-30"></div><div className="h-20 shimmer rounded-xl opacity-30"></div></div>
                <div className="space-y-6"><div className="h-20 shimmer rounded-xl opacity-30"></div><div className="h-20 shimmer rounded-xl opacity-30"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <HeaderSkeleton titleWidth="w-24" />
        <div className="bg-white dark:bg-slate-900 py-12 transition-colors min-h-[calc(100vh-112px)] space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-6 bg-[#f8fafc] dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 shimmer rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-5 w-40 shimmer rounded"></div>
                  <div className="h-4 w-64 shimmer rounded opacity-50"></div>
                </div>
              </div>
              <div className="h-6 w-16 shimmer rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SupportSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <HeaderSkeleton titleWidth="w-48" />
        <div className="max-w-2xl mx-auto p-6 space-y-6 pt-12 overflow-hidden">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 space-y-6 overflow-hidden">
            <div className="h-10 w-full shimmer rounded-lg opacity-50"></div>
            <div className="h-32 w-full shimmer rounded-lg opacity-30"></div>
            <div className="h-10 w-32 shimmer rounded-lg opacity-50"></div>
            <div className="h-12 w-40 shimmer rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingDetailSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex items-center border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30">
          <div className="h-8 w-8 shimmer rounded-lg mr-4"></div>
          <div className="h-6 w-32 shimmer rounded-lg"></div>
        </div>
        <div className="p-4 md:p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
                <div className="p-8 space-y-8">
                  <div className="flex justify-between">
                    <div className="space-y-2"><div className="h-3 w-20 shimmer rounded opacity-50"></div><div className="h-8 w-40 shimmer rounded"></div></div>
                    <div className="h-6 w-20 shimmer rounded-full"></div>
                  </div>
                  <div className="h-32 w-full shimmer rounded-2xl opacity-40"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 shimmer rounded-2xl opacity-30"></div>
                    <div className="h-20 shimmer rounded-2xl opacity-30"></div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="h-24 w-full shimmer rounded-2xl opacity-30"></div>
                  <div className="h-24 w-full shimmer rounded-2xl opacity-30"></div>
                  <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-4 w-full shimmer rounded opacity-20"></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
