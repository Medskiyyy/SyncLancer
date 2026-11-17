'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  GitBranch,
  Plus,
  Receipt,
} from 'lucide-react';

import { AnimatedNumber, FadeIn } from '@/components/ui/motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  invoice: Receipt,
  proposal: FileText,
  lead: GitBranch,
  milestone: Calendar,
};

interface QuickActionLink {
  title: string;
  href: string;
  primary?: boolean;
}

interface AnimatedGreetingProps {
  workspaceName: string;
  userName: string;
  activeProjectsCount: number;
  pendingCount: number;
  quickActions: QuickActionLink[];
}

export function AnimatedGreeting({
  workspaceName,
  userName,
  activeProjectsCount,
  pendingCount,
  quickActions,
}: AnimatedGreetingProps) {
  const firstName = userName.split(' ')[0] || 'Freelancer';

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {workspaceName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {firstName}. {activeProjectsCount} active project{activeProjectsCount === 1 ? '' : 's'} and{' '}
          {pendingCount} pending invoice{pendingCount === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              action.primary
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border bg-background text-foreground hover:bg-secondary'
            )}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface AnimatedKPIGridProps {
  kpis: Array<{
    title: string;
    value: number;
    description: string;
    trendUp?: boolean;
    prefix?: string;
  }>;
}

export function AnimatedKPIGrid({ kpis }: AnimatedKPIGridProps) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 sm:divide-x xl:grid-cols-4 xl:divide-y-0">
      {kpis.map((kpi, idx) => (
        <div key={kpi.title} className="flex flex-col justify-between p-5">
          <div className="text-xs font-medium text-muted-foreground">
            {kpi.title}
          </div>
          <div className="mt-3 font-heading text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-[1.75rem]">
            <AnimatedNumber value={kpi.value} prefix={kpi.prefix} delay={0.08 + idx * 0.04} />
          </div>
          <p
            className={cn(
              'mt-1.5 text-xs',
              kpi.trendUp && kpi.title !== 'Pending Invoices'
                ? 'font-medium text-brand'
                : 'text-muted-foreground'
            )}
          >
            {kpi.description}
          </p>
        </div>
      ))}
    </div>
  );
}

interface UpcomingMilestone {
  title: string;
  dueDate: Date | string;
  projectName: string;
}

interface AnimatedWorkloadActivityProps {
  hoursLogged: number;
  targetHours: number;
  loggedProgressPercent: number;
  activeTasksCount: number;
  upcomingMilestone: UpcomingMilestone | null;
  recentActivities: Array<{
    type: string;
    text: string;
    time: string;
  }>;
}

export function AnimatedWorkloadActivity({
  hoursLogged,
  targetHours,
  loggedProgressPercent,
  activeTasksCount,
  upcomingMilestone,
  recentActivities,
}: AnimatedWorkloadActivityProps) {
  return (
    <div className="grid gap-6 md:grid-cols-7">
      <FadeIn direction="up" delay={0.08} duration={0.3} className="min-w-0 md:col-span-3">
        <Card className="h-full p-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Workload</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Tracked time, active tasks, and next delivery date.</p>
          </div>

          <div className="mt-4 divide-y divide-border">
            <div className="pb-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-brand" strokeWidth={1.75} />
                  <span>Hours logged</span>
                </span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {hoursLogged} / {targetHours} hrs
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                  style={{ width: `${loggedProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                  <span>Active tasks</span>
                </span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {activeTasksCount}
                </span>
              </div>
              <p className="mt-1 pl-5.5 text-xs text-muted-foreground">
                Tasks currently in progress across open milestones.
              </p>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Upcoming milestone</span>
              </div>
              <div className="mt-1.5 pl-5.5 truncate text-sm font-semibold text-foreground">
                {upcomingMilestone ? upcomingMilestone.title : 'No milestone scheduled'}
              </div>
              <div className="mt-0.5 pl-5.5 truncate text-xs text-muted-foreground">
                {upcomingMilestone
                  ? `Due ${format(new Date(upcomingMilestone.dueDate), 'MMM d, yyyy')} in ${upcomingMilestone.projectName}`
                  : 'Add milestones to surface upcoming delivery deadlines.'}
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn direction="up" delay={0.12} duration={0.3} className="min-w-0 md:col-span-4">
        <Card className="h-full p-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Recent activity</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Events from CRM, proposals, invoices, and delivery.</p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="flex min-h-[192px] items-center justify-center text-center">
              <div>
                <Activity className="mx-auto h-7 w-7 text-muted-foreground/60" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-semibold text-foreground">No recent activity</p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  New leads, proposal updates, invoice events, and milestone changes will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-2 divide-y divide-border">
              {recentActivities.map((activity, idx) => {
                const Icon = ACTIVITY_ICONS[activity.type] || Activity;

                return (
                  <div key={`${activity.type}-${idx}`} className="flex items-start justify-between gap-3 py-3 first:pt-2 last:pb-0">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                      <span className="text-sm font-medium leading-snug text-foreground">{activity.text}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
