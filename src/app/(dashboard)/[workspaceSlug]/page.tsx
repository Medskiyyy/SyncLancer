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
  Workflow
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
      icon: DollarSign 
    },
    { 
      title: 'Active Projects', 
      value: String(data.activeProjectsCount), 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: FolderKanban 
    },
    { 
      title: 'Active Clients', 
      value: String(data.activeClientsCount), 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users 
    },
    { 
      title: 'Pending Invoices', 
      value: formatCurrency(data.pendingAmount), 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt 
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
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Here is a real-time summary of your workspace performance and active metrics.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{kpi.value}</div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart Card */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Revenue Over Time</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Monthly rolling billing totals (last 12 months)</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </CardContent>
        </Card>

        {/* Project Statistics Distribution Chart Card */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Projects by Status</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Total projects count distribution across statuses</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Workload & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Workload Card */}
        <Card className="md:col-span-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Workload & Progress</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Weekly tracked targets and upcoming tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-550">{data.hoursLogged} Hours Logged</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Target: {targetHours} hours this week</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div 
                    className="h-full rounded-full bg-indigo-600" 
                    style={{ width: `${loggedProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-655 dark:text-emerald-400">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-550">{data.activeTasksCount} Active Tasks</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Assigned tasks currently in progress or review</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-655 dark:text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-550">
                  {data.upcomingMilestone ? data.upcomingMilestone.title : 'No Upcoming Milestones'}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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
        <Card className="md:col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Recent events across CRM, Proposals, Invoices, and Milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-650 text-sm">
                No recent activity logged in this workspace yet.
              </div>
            ) : (
              <div className="relative border-l border-zinc-150 pl-4 space-y-6 dark:border-zinc-800">
                {data.recentActivities.map((act, idx) => {
                  const Icon = activityIcons[act.type];
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot with icon */}
                      <span className="absolute -left-[27px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-400 dark:text-zinc-600">
                        {Icon ? <Icon className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      </span>
                      <div className="text-sm font-semibold text-zinc-850 dark:text-zinc-150">{act.text}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">{act.time}</div>
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
