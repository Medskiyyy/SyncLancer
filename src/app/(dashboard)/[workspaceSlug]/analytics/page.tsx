import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { ProjectStatusChart } from '@/features/analytics/components/project-status-chart';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { AnalyticsService } from '@/features/analytics/services/analytics-service';
import { AnimatedAnalyticsGrid } from './analytics-sections';
import { FolderKanban, TrendingUp } from 'lucide-react';

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

  const data = await analyticsService.getWorkspaceDashboardData(workspace.id, session.user.id);

  const metrics = [
    {
      title: 'Total Revenue',
      value: data.totalRevenue,
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`,
      prefix: '$',
    },
    {
      title: 'Pending Invoices',
      value: data.pendingAmount,
      description: `${data.pendingCount} outstanding invoice${data.pendingCount === 1 ? '' : 's'}`,
      prefix: '$',
    },
    {
      title: 'Active Projects',
      value: data.activeProjectsCount,
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`,
    },
    {
      title: 'Active Clients',
      value: data.activeClientsCount,
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review revenue, outstanding invoices, client activity, and project distribution.
        </p>
      </div>

      <AnimatedAnalyticsGrid metrics={metrics} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <TrendingUp className="h-4 w-4 text-brand" strokeWidth={1.75} />
              <span>Revenue Over Time</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Rolling monthly revenue trend for paid invoices (last 12 months)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <FolderKanban className="h-4 w-4 text-brand" strokeWidth={1.75} />
              <span>Projects by Status</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
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
