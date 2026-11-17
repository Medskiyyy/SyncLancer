import React from 'react';

export default function WorkspaceLoading() {
  const barHeights = ['h-1/3', 'h-2/3', 'h-1/2', 'h-3/4', 'h-2/5', 'h-5/6', 'h-1/2', 'h-2/3', 'h-3/5', 'h-4/5', 'h-1/4', 'h-1/2'];
  const statusWidths = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/5', 'w-3/5'];

  return (
    <div className="space-y-6 p-1">
      <div className="flex h-40 w-full items-center justify-between rounded-lg border border-border bg-card p-8 shadow-xs">
        <div className="w-2/3 space-y-3">
          <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-6 w-60 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-96 max-w-full rounded-md bg-muted/70 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex h-[120px] flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-muted/80 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-muted/80 animate-pulse" />
            </div>
            <div className="h-7 w-24 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex h-[88px] items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-xs"
          >
            <div className="h-9 w-9 rounded-lg bg-muted/80 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted/70 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-[380px] flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="flex flex-1 items-end gap-3 px-2 pt-8 pb-4">
            {barHeights.map((h, i) => (
              <div key={i} className={`flex-1 ${h} rounded-md bg-muted animate-pulse`} />
            ))}
          </div>
        </div>

        <div className="flex h-[380px] flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-5 py-4">
            {statusWidths.map((w, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-20 rounded bg-muted/80 animate-pulse" />
                  <div className="h-3 w-8 rounded bg-muted/80 animate-pulse" />
                </div>
                <div className={`h-3 ${w} rounded bg-muted animate-pulse`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-xs md:col-span-3">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted/70 animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/80 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-muted/70 animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-xs md:col-span-4">
          <div className="space-y-2 border-b border-border pb-3">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/60 py-2">
                <div className="flex w-2/3 items-center gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-muted/80 animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                </div>
                <div className="h-3 w-12 rounded bg-muted/70 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
