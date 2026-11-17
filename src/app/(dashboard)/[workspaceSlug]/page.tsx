import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { ProjectStatusChart } from '@/features/analytics/components/project-status-chart';
import { AnimatedGreeting, AnimatedKPIGrid, AnimatedWorkloadActivity } from './dashboard-sections';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { AnalyticsService } from '@/features/analytics/services/analytics-service';

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

  const kpis = [
    {
      title: 'Revenue',
      value: data.totalRevenue,
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`,
      trendUp: data.revenueChangePercent > 0,
      prefix: '$',
    },
    {
      title: 'Active Projects',
      value: data.activeProjectsCount,
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`,
      trendUp: data.projectsChangeCount > 0,
    },
    {
      title: 'Active Clients',
      value: data.activeClientsCount,
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`,
      trendUp: data.clientsChangeCount > 0,
    },
    {
      title: 'Pending Invoices',
      value: data.pendingAmount,
      description: `${data.pendingCount} outstanding invoice${data.pendingCount === 1 ? '' : 's'}`,
      trendUp: false,
      prefix: '$',
    },
  ];

  const quickActions = [
    { title: 'Client', href: `/${workspaceSlug}/clients?add=true` },
    { title: 'Proposal', href: `/${workspaceSlug}/proposals/new` },
    { title: 'Project', href: `/${workspaceSlug}/projects/new` },
    { title: 'Invoice', href: `/${workspaceSlug}/invoices?create=true`, primary: true },
  ];

  const targetHours = 40;
  const loggedProgressPercent = Math.min((data.hoursLogged / targetHours) * 100, 100);

  return (
    <div className="space-y-6">
      <AnimatedGreeting
        workspaceName={workspace.name}
        userName={session.user.name || ''}
        activeProjectsCount={data.activeProjectsCount}
        pendingCount={data.pendingCount}
        quickActions={quickActions}
      />

      <AnimatedKPIGrid kpis={kpis} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col overflow-hidden p-6">
          <div className="mb-5 border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold leading-tight text-foreground">
              Revenue Over Time
            </h3>
            <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
              Monthly rolling billing totals across the last 12 months.
            </p>
          </div>
          <div className="flex-1">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </div>
        </Card>

        <Card className="flex flex-col overflow-hidden p-6">
          <div className="mb-5 border-b border-border pb-3">
            <h3 className="font-heading text-base font-bold leading-tight text-foreground">
              Projects by Status
            </h3>
            <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
              Current project count distribution across delivery stages.
            </p>
          </div>
          <div className="flex-1">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </div>
        </Card>
      </div>

      <AnimatedWorkloadActivity
        hoursLogged={data.hoursLogged}
        targetHours={targetHours}
        loggedProgressPercent={loggedProgressPercent}
        activeTasksCount={data.activeTasksCount}
        upcomingMilestone={data.upcomingMilestone}
        recentActivities={data.recentActivities}
      />
    </div>
  );
}
