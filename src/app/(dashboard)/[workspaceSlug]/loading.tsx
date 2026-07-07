import React from 'react';

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 p-1">
      {/* Greeting Card Skeleton - 160px / h-40 */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 h-40 flex items-center justify-between shadow-xs w-full">
        <div className="space-y-3 w-2/3">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md"></div>
          <div className="h-6 w-60 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md"></div>
          <div className="h-3 w-96 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded-md"></div>
        </div>
      </div>

      {/* KPI Grid Skeleton - 120px */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-lg p-5 h-[120px] flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded"></div>
              <div className="h-8 w-8 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded-lg"></div>
            </div>
            <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton - 88px / 4 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-lg p-4 h-[88px] flex items-center gap-4 shadow-xs"
          >
            <div className="h-9 w-9 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
              <div className="h-3 w-32 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-lg p-6 h-[380px] shadow-xs flex flex-col justify-between">
          <div className="space-y-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-3 w-48 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded"></div>
          </div>
          <div className="flex-1 flex items-end gap-3 pt-8 pb-4 px-2">
            {[...Array(12)].map((_, i) => {
              const heights = ['h-1/3', 'h-2/3', 'h-1/2', 'h-3/4', 'h-2/5', 'h-5/6', 'h-1/2', 'h-2/3', 'h-3/5', 'h-4/5', 'h-1/4', 'h-1/2'];
              return (
                <div key={i} className={`flex-1 ${heights[i]} bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded-md`}></div>
              );
            })}
          </div>
        </div>

        <div className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-lg p-6 h-[380px] shadow-xs flex flex-col justify-between">
          <div className="space-y-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-3 w-48 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded"></div>
          </div>
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="h-36 w-36 rounded-full border-8 border-zinc-100 dark:border-zinc-800 border-t-primary animate-spin"></div>
          </div>
        </div>
      </div>

      {/* Bottom List Skeleton - 3+4 split */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-3 border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-lg p-6 shadow-xs space-y-5">
          <div className="space-y-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-3 w-48 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-4 border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-lg p-6 shadow-xs space-y-5">
          <div className="space-y-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-3 w-48 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100/50 dark:border-zinc-850/30">
                <div className="flex items-center gap-3 w-2/3">
                  <div className="h-5 w-5 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded-full shrink-0"></div>
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
                </div>
                <div className="h-3 w-12 bg-zinc-150 dark:bg-zinc-850 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
