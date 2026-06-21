import React from 'react';

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-4 w-96 bg-zinc-100 dark:bg-zinc-900 rounded-lg"></div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 h-[380px] shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
            <div className="h-3.5 w-60 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          </div>
          <div className="flex-1 flex items-end gap-3 pt-8 pb-4 px-2">
            {[...Array(8)].map((_, i) => {
              const heights = ['h-1/3', 'h-2/3', 'h-1/2', 'h-3/4', 'h-2/5', 'h-5/6', 'h-1/2', 'h-2/3'];
              return (
                <div key={i} className={`flex-1 ${heights[i]} bg-zinc-150 dark:bg-zinc-800 rounded-md`}></div>
              );
            })}
          </div>
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded"></div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 h-[380px] shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-855 rounded"></div>
            <div className="h-3.5 w-60 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          </div>
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="h-48 w-48 rounded-full border-16 border-zinc-150 dark:border-zinc-800 border-t-indigo-500 animate-spin"></div>
          </div>
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded"></div>
        </div>
      </div>

      {/* Bottom List Skeleton */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-3.5 w-56 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-zinc-150 dark:bg-zinc-800 rounded-lg"></div>
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-3.5 w-24 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
