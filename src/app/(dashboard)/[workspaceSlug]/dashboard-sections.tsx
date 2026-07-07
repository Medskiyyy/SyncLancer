'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  FolderKanban,
  GitBranch,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import { AnimatedNumber, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const KPI_ICONS: Record<string, LucideIcon> = {
  revenue: DollarSign,
  projects: FolderKanban,
  clients: Users,
  invoices: Receipt,
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  clients: Users,
  proposals: FileText,
  projects: FolderKanban,
  invoices: Receipt,
};

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  invoice: Receipt,
  proposal: FileText,
  lead: GitBranch,
  milestone: Calendar,
};

interface AnimatedGreetingProps {
  userName: string;
  activeProjectsCount: number;
  pendingCount: number;
}

export function AnimatedGreeting({ userName, activeProjectsCount, pendingCount }: AnimatedGreetingProps) {
  const firstName = userName.split(' ')[0] || 'Freelancer';

  return (
    <FadeIn direction="up" delay={0.02} duration={0.35}>
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workspace overview</p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Welcome back, {firstName}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review active delivery, billing pressure, and recent workspace activity before opening a specific module.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
              <div className="text-xs text-muted-foreground">Active projects</div>
              <div className="mt-1 font-mono text-xl font-semibold text-foreground">{activeProjectsCount}</div>
            </div>
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
              <div className="text-xs text-muted-foreground">Pending invoices</div>
              <div className="mt-1 font-mono text-xl font-semibold text-foreground">{pendingCount}</div>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

interface AnimatedKPIGridProps {
  kpis: Array<{
    title: string;
    value: number;
    description: string;
    icon: string;
    trendUp?: boolean;
    prefix?: string;
  }>;
}

export function AnimatedKPIGrid({ kpis }: AnimatedKPIGridProps) {
  const borderColors = [
    'border-l-emerald-500',
    'border-l-blue-500',
    'border-l-violet-500',
    'border-l-amber-500',
  ];

  return (
    <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" staggerChildren={0.05} delayChildren={0.08}>
      {kpis.map((kpi, idx) => {
        const Icon = KPI_ICONS[kpi.icon] || Activity;
        const TrendIcon = kpi.trendUp ? TrendingUp : TrendingDown;

        return (
          <StaggerItem key={kpi.title}>
            <Card
              className={cn(
                'h-[112px] justify-between border-l-2 p-4',
                borderColors[idx] || 'border-l-primary',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{kpi.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                    <AnimatedNumber value={kpi.value} prefix={kpi.prefix} delay={0.16 + idx * 0.04} />
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{kpi.description}</p>
                </div>
                {kpi.title !== 'Pending Invoices' && (
                  <TrendIcon
                    className={cn(
                      'mb-1 h-4 w-4 shrink-0',
                      kpi.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                    )}
                  />
                )}
              </div>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

interface AnimatedQuickActionsProps {
  quickActions: Array<{
    title: string;
    href: string;
    desc: string;
    icon: string;
    color: string;
  }>;
}

export function AnimatedQuickActions({ quickActions }: AnimatedQuickActionsProps) {
  return (
    <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" staggerChildren={0.04} delayChildren={0.18}>
      {quickActions.map((action) => {
        const Icon = ACTION_ICONS[action.icon] || Activity;

        return (
          <StaggerItem key={action.title}>
            <Link
              href={action.href}
              className="flex h-20 items-center gap-3 rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md border', action.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{action.title}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{action.desc}</div>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
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
      <FadeIn direction="up" delay={0.32} duration={0.35} className="md:col-span-3">
        <Card className="h-full p-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-heading text-base font-semibold text-foreground">Workload</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Tracked time, active tasks, and the next delivery date.</p>
          </div>

          <div className="mt-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                  <span>Hours logged</span>
                  <span className="font-mono text-foreground">{hoursLogged} / {targetHours} hrs</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${loggedProgressPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active tasks</div>
                <div className="mt-1 text-sm font-medium text-foreground">{activeTasksCount} tasks in progress</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Assigned inside active milestones.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upcoming milestone</div>
                <div className="mt-1 truncate text-sm font-medium text-foreground">
                  {upcomingMilestone ? upcomingMilestone.title : 'No milestone scheduled'}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {upcomingMilestone
                    ? `Due ${format(new Date(upcomingMilestone.dueDate), 'MMM d, yyyy')} in ${upcomingMilestone.projectName}`
                    : 'Add milestones to make delivery risk visible.'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn direction="up" delay={0.36} duration={0.35} className="md:col-span-4">
        <Card className="h-full p-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-heading text-base font-semibold text-foreground">Recent activity</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Events from CRM, proposals, invoices, and delivery.</p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="flex min-h-[192px] items-center justify-center text-center">
              <div>
                <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">No recent activity</p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  New leads, proposal updates, invoice events, and milestone changes will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {recentActivities.map((activity, idx) => {
                const Icon = ACTIVITY_ICONS[activity.type] || Activity;

                return (
                  <div key={`${activity.type}-${idx}`} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-snug text-foreground">{activity.text}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{activity.time}</div>
                    </div>
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
