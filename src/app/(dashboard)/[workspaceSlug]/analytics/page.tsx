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
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    { 
      title: 'Pending Invoices', 
      value: formatCurrency(data.pendingAmount), 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt,
      color: 'bg-slate-50 text-slate-500 border-slate-100',
    },
    { 
      title: 'Active Projects', 
      value: String(data.activeProjectsCount), 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: FolderKanban,
      color: 'bg-slate-50 text-slate-500 border-slate-100',
    },
    { 
      title: 'Active Clients', 
      value: String(data.activeClientsCount), 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users,
      color: 'bg-slate-50 text-slate-500 border-slate-100',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Title Header */}
      <div className="pb-6 border-b border-slate-100">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze financial trend matrices, active projects statuses, and workload metrics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{kpi.title}</CardTitle>
                <div className={cn("p-1.5 rounded-lg border", kpi.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{kpi.value}</div>
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Block */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Line Chart */}
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-blue-600" /> Revenue Over Time
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Rolling monthly revenue trend for paid invoices (last 12 months)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </CardContent>
        </Card>

        {/* Project status bar/pie chart */}
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="h-4.5 w-4.5 text-blue-600" /> Projects by Status
            </CardTitle>
            <CardDescription className="text-slate-505 text-xs">
              Distribution of project workload across lifecycle statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
