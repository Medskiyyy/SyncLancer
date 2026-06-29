'use client';

import * as React from 'react';
import { StaggerContainer, StaggerItem, AnimatedNumber, FadeIn } from '@/components/ui/motion';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TrendUp, Sparkle, Clock, CheckSquare, Calendar } from '@phosphor-icons/react';
import { format } from 'date-fns';

interface AnimatedGreetingProps {
  userName: string;
  activeProjectsCount: number;
  pendingCount: number;
}

export function AnimatedGreeting({ userName, activeProjectsCount, pendingCount }: AnimatedGreetingProps) {
  return (
    <FadeIn direction="up" delay={0.02} duration={0.4}>
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white dark:bg-zinc-900/60 backdrop-blur-md px-8 py-6 h-40 flex items-center justify-between shadow-xs w-full">
        {/* Liquid Glass ambient mesh gold glow */}
        <div className="absolute right-0 top-0 h-40 w-60 translate-x-10 -translate-y-5 rounded-full bg-primary/5 dark:bg-primary/8 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col justify-center space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
              <Sparkle className="h-3 w-3 shrink-0 animate-pulse" weight="fill" />
              <span>Live Workspace</span>
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
            Welcome back, {userName.split(' ')[0] || 'Freelancer'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
            Workspace summary: you have {activeProjectsCount} active projects and {pendingCount} outstanding invoices.
          </p>
        </div>
        <div className="hidden sm:block text-right pr-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Updated: Just now</span>
        </div>
      </div>
    </FadeIn>
  );
}

interface AnimatedKPIGridProps {
  kpis: Array<{
    title: string;
    value: number;
    description: string;
    icon: any;
    trendUp?: boolean;
    prefix?: string;
  }>;
}

export function AnimatedKPIGrid({ kpis }: AnimatedKPIGridProps) {
  // Border colors matching each KPI role to break the "all identical" pattern
  const borders = [
    'border-l-emerald-500/70 dark:border-l-emerald-500/50', // Revenue
    'border-l-blue-500/70 dark:border-l-blue-500/50',       // Active Projects
    'border-l-violet-500/70 dark:border-l-violet-500/50',   // Active Clients
    'border-l-amber-500/70 dark:border-l-amber-500/50',     // Pending Invoices
  ];

  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerChildren={0.06} delayChildren={0.1}>
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <StaggerItem key={kpi.title}>
            <Card 
              variant="elevated"
              className={cn(
                "hover-lift border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 border-l-[3px] rounded-2xl overflow-hidden relative h-[120px] p-5 flex flex-col justify-between cursor-pointer",
                borders[idx]
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                  {kpi.title}
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-50 text-zinc-450 dark:bg-zinc-950/60 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/60">
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                  <AnimatedNumber 
                    value={kpi.value} 
                    prefix={kpi.prefix} 
                    delay={0.2 + idx * 0.05}
                  />
                </span>
                {kpi.title !== 'Pending Invoices' && (
                  <div className="flex items-center gap-1">
                    <TrendUp className={cn("h-4 w-4", kpi.trendUp ? 'text-emerald-500' : 'text-zinc-450 rotate-180')} />
                    <span className="text-[10px] font-medium text-zinc-500">{kpi.description.split(' ')[0]}</span>
                  </div>
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
    icon: any;
    color: string;
  }>;
}

export function AnimatedQuickActions({ quickActions, workspaceSlug }: AnimatedQuickActionsProps & { workspaceSlug: string }) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerChildren={0.04} delayChildren={0.25}>
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <StaggerItem key={action.title}>
            <Link href={action.href} className="w-full">
              <div className="hover-lift border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl p-4 h-[88px] flex items-center gap-4 shadow-xs cursor-pointer w-full">
                <div className={cn("p-2 rounded-lg border shrink-0", action.color)}>
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                    {action.title}
                  </span>
                  <span className="text-xs text-zinc-450 truncate dark:text-zinc-500 mt-1 font-medium">
                    {action.desc}
                  </span>
                </div>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

interface AnimatedWorkloadActivityProps {
  hoursLogged: number;
  targetHours: number;
  loggedProgressPercent: number;
  activeTasksCount: number;
  upcomingMilestone: any;
  recentActivities: Array<{
    type: string;
    text: string;
    time: string;
  }>;
  activityIcons: Record<string, any>;
}

export function AnimatedWorkloadActivity({
  hoursLogged,
  targetHours,
  loggedProgressPercent,
  activeTasksCount,
  upcomingMilestone,
  recentActivities,
  activityIcons,
}: AnimatedWorkloadActivityProps) {
  return (
    <div className="grid gap-6 md:grid-cols-7">
      {/* Workload Card */}
      <FadeIn direction="up" delay={0.4} duration={0.4} className="md:col-span-3">
        <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl shadow-xs p-6 h-full">
          <div className="border-b border-zinc-100 dark:border-zinc-850/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Workload & Progress</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Weekly tracked targets and upcoming tasks</p>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-primary border border-primary/20 dark:bg-zinc-950/60">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Hours Logged</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 font-mono mt-0.5">
                  {hoursLogged} hrs / {targetHours} hrs target
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-955 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${loggedProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-zinc-955/60 dark:text-emerald-450">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Tasks</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-0.5">
                  {activeTasksCount} tasks in progress
                </div>
                <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5 leading-tight">Assigned to you in active milestones</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-955/60 dark:text-stone-400 dark:border-stone-850">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Upcoming Milestone</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate mt-0.5">
                  {upcomingMilestone ? upcomingMilestone.title : 'No milestones scheduled'}
                </div>
                <div className="text-[10px] text-zinc-455 dark:text-zinc-500 truncate mt-0.5 leading-tight">
                  {upcomingMilestone 
                    ? `Due on ${format(new Date(upcomingMilestone.dueDate), 'MMM d, yyyy')} (${upcomingMilestone.projectName})`
                    : 'All milestones completed or none defined'
                  }
                </div>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Recent Activity Card */}
      <FadeIn direction="up" delay={0.45} duration={0.4} className="md:col-span-4">
        <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl shadow-xs p-6 h-full">
          <div className="border-b border-zinc-100 dark:border-zinc-850/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Recent Activity</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Recent events across CRM, Proposals, Invoices, and Milestones</p>
          </div>
          <div>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
                No recent activity logged in this workspace yet.
              </div>
            ) : (
              <div className="relative border-l border-zinc-200 dark:border-zinc-850 pl-4 ml-2 space-y-6">
                {recentActivities.map((act, idx) => {
                  const Icon = activityIcons[act.type];
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot with icon */}
                      <span className="absolute -left-[27px] top-0.5 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 shadow-xs text-zinc-400 dark:text-zinc-500">
                        {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : <Clock className="h-3.5 w-3.5" />}
                      </span>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-normal">{act.text}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-semibold uppercase tracking-wider">{act.time}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
