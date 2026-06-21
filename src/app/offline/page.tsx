'use client';

import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center space-y-6 p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
        {/* Animated Icon Container */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-450 animate-pulse">
          <WifiOff className="h-8 w-8" />
        </div>

        {/* Header Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            You are Offline
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            It looks like you've lost your network connection.
          </p>
        </div>

        {/* Explanation Card */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-150 dark:border-zinc-850 text-left">
          <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
            SyncLancer caches core pages so you can continue viewing details. However, to synchronize active records, edit pipelines, or process invoicing, a network connection is required.
          </p>
        </div>

        {/* Retry Button */}
        <div>
          <Button 
            onClick={handleReload}
            className="w-full bg-indigo-650 hover:bg-indigo-755 text-white font-extrabold h-11 flex items-center justify-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            <span>Check Connection</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
