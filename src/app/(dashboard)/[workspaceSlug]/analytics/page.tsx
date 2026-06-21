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
   TrendingUp
} from 'lucide-react';

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
      color: 'text-emerald-500'
    },
    { 
      title: 'Pending Invoices', 
      value: formatCurrency(data.pendingAmount), 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt,
      color: 'text-amber-500'
    },
    { 
      title: 'Active Projects', 
      value: String(data.activeProjectsCount), 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: FolderKanban,
      color: 'text-blue-500'
    },
    { 
      title: 'Active Clients', 
      value: String(data.activeClientsCount), 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users,
      color: 'text-indigo-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-550">Analytics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Analyze workspace financial performance, active projects, and tracking metrics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{kpi.value}</div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Block */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Line Chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" /> Revenue Over Time
            </CardTitle>
            <CardDescription className="text-zinc-550 dark:text-zinc-400 text-xs">
              Rolling monthly revenue trend for paid invoices (last 12 months)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </CardContent>
        </Card>

        {/* Project status bar/pie chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <FolderKanban className="h-4.5 w-4.5 text-indigo-500" /> Projects by Status
            </CardTitle>
            <CardDescription className="text-zinc-555 dark:text-zinc-400 text-xs">
              Distribution of project workload across lifecycle statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Block */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly Productivity Metrics */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Workload Summary</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Tracked productive metrics for the current week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shrink-0">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-zinc-800 dark:text-zinc-200">{data.hoursLogged} Hours Tracked</div>
                <div className="text-[10px] text-zinc-450 mt-0.5">Tracked this week</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-emerald-650 dark:text-emerald-400 shrink-0">
                <CheckSquare className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-zinc-800 dark:text-zinc-200">{data.activeTasksCount} Active Tasks</div>
                <div className="text-[10px] text-zinc-455 mt-0.5">Tasks currently in progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
