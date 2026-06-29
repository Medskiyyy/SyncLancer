import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { ProjectStatusChart } from '@/features/analytics/components/project-status-chart';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { AnalyticsService } from '@/features/analytics/services/analytics-service';
import { 
  CurrencyDollar, 
  Folder, 
  Users, 
  Receipt, 
  Calendar, 
  Clock, 
  CheckSquare,
  FileText,
  GitBranch, 
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const workspaceService = new WorkspaceService();
const analyticsService = new AnalyticsService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceDashboardPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  const data = await analyticsService.getWorkspaceDashboardData(workspace.id, session.user.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpis = [
    { 
      title: 'Revenue', 
      value: formatCurrency(data.totalRevenue), 
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`, 
      icon: CurrencyDollar,
      trendUp: data.revenueChangePercent >= 0,
    },
    { 
      title: 'Active Projects', 
      value: String(data.activeProjectsCount), 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: Folder,
      trendUp: data.projectsChangeCount >= 0,
    },
    { 
      title: 'Active Clients', 
      value: String(data.activeClientsCount), 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users,
      trendUp: data.clientsChangeCount >= 0,
    },
    { 
      title: 'Pending Invoices', 
      value: formatCurrency(data.pendingAmount), 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt,
      trendUp: false,
    },
  ];

  const quickActions = [
    { title: 'New Client', href: `/${workspaceSlug}/clients?add=true`, desc: 'Add client contact card', icon: Users, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20' },
    { title: 'New Proposal', href: `/${workspaceSlug}/proposals/new`, desc: 'Draft freelancer pitch', icon: FileText, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20' },
    { title: 'New Project', href: `/${workspaceSlug}/projects/new`, desc: 'Launch project dashboard', icon: Folder, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20' },
    { title: 'New Invoice', href: `/${workspaceSlug}/invoices?create=true`, desc: 'Generate billing statement', icon: Receipt, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20' },
  ];

  const targetHours = 40;
  const loggedProgressPercent = Math.min((data.hoursLogged / targetHours) * 100, 100);

  const activityIcons: Record<string, any> = {
    invoice: Receipt,
    proposal: FileText,
    lead: GitBranch,
    milestone: Calendar,
  };

  return (
    <div className="space-y-6">
      {/* Greeting Card - exactly 160px height, full width */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white dark:bg-zinc-900 px-8 py-6 h-40 flex items-center justify-between shadow-xs w-full">
        {/* Liquid Glass ambient mesh gold glow */}
        <div className="absolute right-0 top-0 h-40 w-60 translate-x-10 -translate-y-5 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col justify-center space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
              <Sparkle className="h-3 w-3 shrink-0" weight="fill" />
              <span>Live Workspace</span>
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
            Welcome back, {session.user.name?.split(' ')[0] || 'Freelancer'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
            Workspace summary: you have {data.activeProjectsCount} active projects and {data.pendingCount} outstanding invoices.
          </p>
        </div>
        <div className="hidden sm:block text-right pr-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Updated: Just now</span>
        </div>
      </div>

      {/* KPI Cards Row - exactly 120px height, border-radius 16px, padding 20px */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className="hover-lift border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden relative h-[120px] p-5 flex flex-col justify-between shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                  {kpi.title}
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-50 text-zinc-450 dark:bg-zinc-950 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800">
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                  {kpi.value}
                </span>
                {kpi.title !== 'Pending Invoices' && (
                  <div className="flex items-center gap-1">
                    <TrendUp className={`h-4 w-4 ${kpi.trendUp ? 'text-green-600' : 'text-zinc-450 rotate-180'}`} />
                    <span className="text-[10px] font-medium text-zinc-500">{kpi.description.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Row - exactly 88px height, 4 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="w-full">
              <div className="hover-lift border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-2xl p-4 h-[88px] flex items-center gap-4 shadow-xs cursor-pointer w-full">
                <div className={cn("p-2 rounded-lg border shrink-0", action.color)}>
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                    {action.title}
                  </span>
                  <span className="text-xs text-zinc-400 truncate dark:text-zinc-500 mt-1 font-medium">
                    {action.desc}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart Card */}
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col">
          <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Revenue Over Time</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Monthly rolling billing totals (last 12 months)</p>
          </div>
          <div className="flex-1">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </div>
        </Card>

        {/* Project Statistics Chart Card */}
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col">
          <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Projects by Status</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Total projects count distribution across statuses</p>
          </div>
          <div className="flex-1">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </div>
        </Card>
      </div>

      {/* Workload & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Workload Card */}
        <Card className="md:col-span-3 border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xs p-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Workload & Progress</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Weekly tracked targets and upcoming tasks</p>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-primary border border-primary/20 dark:bg-zinc-800">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Hours Logged</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 font-mono mt-0.5">
                  {data.hoursLogged} hrs / {targetHours} hrs target
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary" 
                    style={{ width: `${loggedProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-zinc-800 dark:text-emerald-450">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Tasks</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-0.5">
                  {data.activeTasksCount} tasks in progress
                </div>
                <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5 leading-tight">Assigned to you in active milestones</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-800 dark:text-stone-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Upcoming Milestone</div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate mt-0.5">
                  {data.upcomingMilestone ? data.upcomingMilestone.title : 'No milestones scheduled'}
                </div>
                <div className="text-[10px] text-zinc-450 dark:text-zinc-500 truncate mt-0.5 leading-tight">
                  {data.upcomingMilestone 
                    ? `Due on ${format(new Date(data.upcomingMilestone.dueDate), 'MMM d, yyyy')} (${data.upcomingMilestone.projectName})`
                    : 'All milestones completed or none defined'
                  }
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="md:col-span-4 border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xs p-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Recent Activity</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Recent events across CRM, Proposals, Invoices, and Milestones</p>
          </div>
          <div>
            {data.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
                No recent activity logged in this workspace yet.
              </div>
            ) : (
              <div className="relative border-l border-zinc-200 dark:border-zinc-800/60 pl-4 ml-2 space-y-6">
                {data.recentActivities.map((act, idx) => {
                  const Icon = activityIcons[act.type];
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot with icon */}
                      <span className="absolute -left-[27px] top-0.5 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-zinc-400 dark:text-zinc-500">
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
      </div>
    </div>
  );
}
