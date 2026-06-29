import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { ProjectStatusChart } from '@/features/analytics/components/project-status-chart';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { AnalyticsService } from '@/features/analytics/services/analytics-service';
import { AnimatedAnalyticsGrid } from './analytics-sections';
import { FadeIn } from '@/components/ui/motion';
import { 
   DollarSign, 
   FolderKanban, 
   Users, 
   Receipt,
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

  const metrics = [
    { 
      title: 'Total Revenue', 
      value: data.totalRevenue, 
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`, 
      icon: DollarSign,
      prefix: '$',
    },
    { 
      title: 'Pending Invoices', 
      value: data.pendingAmount, 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: Receipt,
      prefix: '$',
    },
    { 
      title: 'Active Projects', 
      value: data.activeProjectsCount, 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: FolderKanban,
    },
    { 
      title: 'Active Clients', 
      value: data.activeClientsCount, 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <FadeIn direction="up" delay={0.02} duration={0.35}>
        <div className="pb-6 border-b border-border/60">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Analyze financial trend matrices, active projects statuses, and workload metrics.
          </p>
        </div>
      </FadeIn>

      {/* KPI Cards Grid */}
      <AnimatedAnalyticsGrid metrics={metrics} />

      {/* Main Charts Block */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Line Chart */}
        <FadeIn direction="up" delay={0.2} duration={0.4}>
          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 font-heading">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Revenue Over Time
              </CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                Rolling monthly revenue trend for paid invoices (last 12 months)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <RevenueChart data={data.monthlyRevenueTrend} />
            </CardContent>
          </Card>
        </FadeIn>

        {/* Project status bar/pie chart */}
        <FadeIn direction="up" delay={0.25} duration={0.4}>
          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 font-heading">
                <FolderKanban className="h-4.5 w-4.5 text-primary" /> Projects by Status
              </CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                Distribution of project workload across lifecycle statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <ProjectStatusChart data={data.projectStatusDistribution} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
