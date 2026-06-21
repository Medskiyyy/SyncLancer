import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { ProjectStatusChart } from '@/features/analytics/components/project-status-chart';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { AnalyticsService } from '@/features/analytics/services/analytics-service';
import { 
  DollarSign, 
  FolderKanban, 
  Users, 
  Receipt, 
  Calendar, 
  Clock, 
  CheckSquare,
  FileText,
  Workflow,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

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

  // Load workspace dashboard data
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
      title: 'Total Revenue', 
      value: formatCurrency(data.totalRevenue), 
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`, 
      icon: DollarSign,
      trendUp: data.revenueChangePercent >= 0,
      isHero: true,
    },
    { 
      title: 'Active Projects', 
      value: String(data.activeProjectsCount), 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: FolderKanban,
      trendUp: data.projectsChangeCount >= 0,
      isHero: false,
    },
    { 
      title: 'Active Clients', 
      value: String(data.activeClientsCount), 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users,
      trendUp: data.clientsChangeCount >= 0,
      isHero: false,
    },
    { 
      title: 'Pending Invoices', 
      value: formatCurrency(data.pendingAmount), 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt,
      trendUp: false,
      isHero: false,
    },
  ];

  const targetHours = 40;
  const loggedProgressPercent = Math.min((data.hoursLogged / targetHours) * 100, 100);

  // Icon mapping for activity items
  const activityIcons: Record<string, any> = {
    invoice: Receipt,
    proposal: FileText,
    lead: Workflow,
    milestone: Calendar,
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 px-6 py-8 shadow-xs">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-amber-550/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/15">
                <Sparkles className="h-3 w-3" />
                <span>Live Workspace</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back, {session.user.name?.split(' ')[0] || 'Partner'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Here is your workspace activity and performance breakdown for {format(new Date(), 'MMMM yyyy')}.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className={`border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover-lift relative ${
                kpi.isHero ? 'premium-glow border-amber-500/20' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2.5">
                <CardTitle className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                  {kpi.title}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${
                  kpi.isHero 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                    : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {kpi.title !== 'Pending Invoices' && (
                    <TrendingUp className={`h-3.5 w-3.5 ${kpi.trendUp ? 'text-green-600 dark:text-green-500' : 'text-zinc-400 rotate-180'}`} />
                  )}
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {kpi.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart Card */}
        <Card className="border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Revenue Over Time</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Monthly rolling billing totals (last 12 months)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </CardContent>
        </Card>

        {/* Project Statistics Distribution Chart Card */}
        <Card className="border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Projects by Status</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Total projects count distribution across statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Workload & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Workload Card */}
        <Card className="md:col-span-3 border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Workload & Progress</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Weekly tracked targets and upcoming tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Hours Logged</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                  {data.hoursLogged} hrs / {targetHours} hrs target
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600" 
                    style={{ width: `${loggedProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Tasks</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {data.activeTasksCount} tasks in progress
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Assigned to you in active milestones</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-500/10 text-stone-650 dark:text-stone-400 border border-stone-550/15">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Upcoming Milestone</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                  {data.upcomingMilestone ? data.upcomingMilestone.title : 'No milestones scheduled'}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {data.upcomingMilestone 
                    ? `Due on ${format(new Date(data.upcomingMilestone.dueDate), 'MMM d, yyyy')} (${data.upcomingMilestone.projectName})`
                    : 'All milestones completed or none defined'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="md:col-span-4 border-zinc-200/70 dark:border-zinc-855 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Recent events across CRM, Proposals, Invoices, and Milestones</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {data.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
                No recent activity logged in this workspace yet.
              </div>
            ) : (
              <div className="relative border-l border-zinc-200 dark:border-zinc-800 pl-4 ml-2 space-y-6">
                {data.recentActivities.map((act, idx) => {
                  const Icon = activityIcons[act.type];
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot with icon */}
                      <span className="absolute -left-[27px] top-0 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-zinc-400 dark:text-zinc-500">
                        {Icon ? <Icon className="h-3 w-3 text-amber-600 dark:text-amber-400" /> : <Clock className="h-3 w-3" />}
                      </span>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{act.text}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium uppercase tracking-wider">{act.time}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
