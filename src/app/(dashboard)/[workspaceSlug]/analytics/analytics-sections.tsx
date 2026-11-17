'use client';

import * as React from 'react';
import { StaggerContainer, StaggerItem, AnimatedNumber } from '@/components/ui/motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerChildren={0.06} delayChildren={0.05}>
      {metrics.map((kpi, idx) => {
        const Icon = ANALYTICS_ICONS[kpi.icon as keyof typeof ANALYTICS_ICONS] || DollarSign;
        return (
          <StaggerItem key={kpi.title}>
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {kpi.title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  <AnimatedNumber
                    value={kpi.value}
                    prefix={kpi.prefix}
                    delay={0.1 + idx * 0.05}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground">
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
