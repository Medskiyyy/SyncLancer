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
   Clock,
   CheckSquare,
   TrendingUp,
   Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const workspaceService = new WorkspaceService();
const analyticsService = new AnalyticsService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceAnalyticsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  // Load analytics dashboard data
  const data = await analyticsService.getWorkspaceDashboardData(workspace.id, session.user.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    { 
      title: 'Total Revenue', 
      value: formatCurrency(data.totalRevenue), 
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`, 
      icon: DollarSign,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15',
      isHero: true
    },
    { 
      title: 'Pending Invoices', 
      value: formatCurrency(data.pendingAmount), 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt,
      color: 'bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500',
      isHero: false
    },
    { 
      title: 'Active Projects', 
      value: String(data.activeProjectsCount), 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: FolderKanban,
      color: 'bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500',
      isHero: false
    },
    { 
      title: 'Active Clients', 
      value: String(data.activeClientsCount), 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users,
      color: 'bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500',
      isHero: false
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Title Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 px-6 py-8 shadow-xs">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-amber-550/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/15">
                <Sparkles className="h-3 w-3" />
                <span>Live Analytics</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-55 animate-fade-in">Workspace Analytics</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Analyze financial trend matrices, active projects statuses, and workload metrics.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className={cn(
                "border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover-lift relative",
                kpi.isHero ? "premium-glow border-amber-500/25" : ""
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2.5">
                <CardTitle className="text-xs font-bold tracking-wider text-zinc-450 dark:text-zinc-500 uppercase">{kpi.title}</CardTitle>
                <div className={cn("p-1.5 rounded-lg border", kpi.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">{kpi.value}</div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Block */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Line Chart */}
        <Card className="border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" /> Revenue Over Time
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-450 text-xs">
              Rolling monthly revenue trend for paid invoices (last 12 months)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </CardContent>
        </Card>

        {/* Project status bar/pie chart */}
        <Card className="border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <FolderKanban className="h-4.5 w-4.5 text-primary" /> Projects by Status
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-450 text-xs">
              Distribution of project workload across lifecycle statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Block */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly Productivity Metrics */}
        <Card className="border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-800/60 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Workload Summary</CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Tracked productive metrics for the current week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-semibold pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-zinc-900 dark:text-zinc-100 font-bold">{data.hoursLogged} Hours Tracked</div>
                <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5 font-medium">Logged this calendar week</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15 flex items-center justify-center shrink-0">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-zinc-900 dark:text-zinc-100 font-bold">{data.activeTasksCount} Active Tasks</div>
                <div className="text-[10px] text-zinc-455 dark:text-zinc-500 mt-0.5 font-medium">Tasks currently in progress or review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
