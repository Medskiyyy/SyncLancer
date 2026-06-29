'use client';

import * as React from 'react';
import { StaggerContainer, StaggerItem, AnimatedNumber, FadeIn } from '@/components/ui/motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DollarSign, FolderKanban, Users, Receipt } from 'lucide-react';

const ANALYTICS_ICONS = {
  revenue: DollarSign,
  invoices: Receipt,
  projects: FolderKanban,
  clients: Users,
};

interface AnimatedAnalyticsGridProps {
  metrics: Array<{
    title: string;
    value: number;
    description: string;
    icon: string;
    prefix?: string;
  }>;
}

export function AnimatedAnalyticsGrid({ metrics }: AnimatedAnalyticsGridProps) {
  const borders = [
    'border-l-emerald-500/70 dark:border-l-emerald-500/50', // Total Revenue
    'border-l-amber-500/70 dark:border-l-amber-500/50',     // Pending Invoices
    'border-l-blue-500/70 dark:border-l-blue-500/50',       // Active Projects
    'border-l-violet-500/70 dark:border-l-violet-500/50',   // Active Clients
  ];

  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerChildren={0.06} delayChildren={0.05}>
      {metrics.map((kpi, idx) => {
        const Icon = ANALYTICS_ICONS[kpi.icon as keyof typeof ANALYTICS_ICONS] || DollarSign;
        return (
          <StaggerItem key={kpi.title}>
            <Card 
              variant="elevated"
              className={cn(
                "hover-lift border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 border-l-[3px] rounded-2xl overflow-hidden shadow-xs",
                borders[idx]
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                  {kpi.title}
                </CardTitle>
                <div className="p-1.5 rounded-lg bg-zinc-50 text-zinc-450 dark:bg-zinc-950/60 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/60">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                  <AnimatedNumber 
                    value={kpi.value} 
                    prefix={kpi.prefix} 
                    delay={0.1 + idx * 0.05}
                  />
                </div>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-550 mt-1.5 font-medium">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
