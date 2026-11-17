import React from 'react';

export default function WorkspaceLoading() {
  const barHeights = ['h-1/3', 'h-2/3', 'h-1/2', 'h-3/4', 'h-2/5', 'h-5/6', 'h-1/2', 'h-2/3', 'h-3/5', 'h-4/5', 'h-1/4', 'h-1/2'];
  const statusWidths = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/5', 'w-3/5'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-secondary animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-md bg-secondary animate-pulse" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 sm:divide-x xl:grid-cols-4 xl:divide-y-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3 p-5">
            <div className="h-3.5 w-24 rounded bg-secondary animate-pulse" />
            <div className="h-7 w-28 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-[380px] flex-col justify-between rounded-lg border border-border bg-card p-6">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex flex-1 items-end gap-3 px-2 pt-8 pb-4">
            {barHeights.map((h, i) => (
              <div key={i} className={`flex-1 ${h} rounded-md bg-secondary animate-pulse`} />
            ))}
          </div>
        </div>

        <div className="flex h-[380px] flex-col justify-between rounded-lg border border-border bg-card p-6">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-5 py-4">
            {statusWidths.map((w, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-8 rounded bg-secondary animate-pulse" />
                </div>
                <div className={`h-3 ${w} rounded bg-muted animate-pulse`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="space-y-5 rounded-lg border border-border bg-card p-5 md:col-span-3">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-28 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-44 rounded bg-muted animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-secondary animate-pulse" />
              <div className="h-3 w-48 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-5 md:col-span-4">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="h-4 w-2/3 rounded bg-secondary animate-pulse" />
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
