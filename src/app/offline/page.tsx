'use client';

import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
          <WifiOff className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            You are Offline
          </h1>
          <p className="text-sm text-muted-foreground">
            It looks like you&rsquo;ve lost your network connection.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-left">
          <p className="text-xs leading-relaxed text-muted-foreground">
            SyncLancer caches core pages so you can continue viewing details. However, to synchronize active records, edit pipelines, or process invoicing, a network connection is required.
          </p>
        </div>

        <Button
          onClick={handleReload}
          variant="default"
          className="flex h-10 w-full items-center justify-center gap-2 font-semibold"
        >
          <RotateCw className="h-4 w-4" />
          <span>Check Connection</span>
        </Button>
      </div>
    </div>
  );
}
