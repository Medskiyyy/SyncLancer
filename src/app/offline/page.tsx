'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RotateCw } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="mb-8">
        <Link href="/">
          <BrandLogo />
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-destructive" strokeWidth={1.75} />
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Connection offline
          </h1>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          You have lost your network connection. Core pages remain cached locally, while syncing CRM pipelines, projects, and invoices requires an active connection.
        </p>

        <Button
          onClick={handleReload}
          variant="default"
          className="h-10 w-full gap-2"
        >
          <RotateCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </Button>
      </div>
    </div>
  );
}
