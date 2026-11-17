'use client';

import * as React from 'react';
import { AnimatedNumber } from '@/components/ui/motion';

interface AnimatedAnalyticsGridProps {
  metrics: Array<{
    title: string;
    value: number;
    description: string;
    prefix?: string;
  }>;
}

export function AnimatedAnalyticsGrid({ metrics }: AnimatedAnalyticsGridProps) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 sm:divide-x xl:grid-cols-4 xl:divide-y-0">
      {metrics.map((kpi, idx) => (
        <div key={kpi.title} className="flex flex-col justify-between p-5">
          <div className="text-xs font-medium text-muted-foreground">
            {kpi.title}
          </div>
          <div className="mt-3 font-heading text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-[1.75rem]">
            <AnimatedNumber
              value={kpi.value}
              prefix={kpi.prefix}
              delay={0.08 + idx * 0.04}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {kpi.description}
          </p>
        </div>
      ))}
    </div>
  );
}
