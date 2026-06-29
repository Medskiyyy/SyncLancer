import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { ProjectStatusChart } from '@/features/analytics/components/project-status-chart';
import { AnimatedGreeting, AnimatedKPIGrid, AnimatedQuickActions, AnimatedWorkloadActivity } from './dashboard-sections';
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
      value: data.totalRevenue, 
      description: `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% from last month`, 
      icon: 'revenue',
      trendUp: data.revenueChangePercent >= 0,
      prefix: '$',
    },
    { 
      title: 'Active Projects', 
      value: data.activeProjectsCount, 
      description: `${data.projectsChangeCount >= 0 ? '+' : ''}${data.projectsChangeCount} since last month`, 
      icon: 'projects',
      trendUp: data.projectsChangeCount >= 0,
    },
    { 
      title: 'Active Clients', 
      value: data.activeClientsCount, 
      description: `${data.clientsChangeCount >= 0 ? '+' : ''}${data.clientsChangeCount} since last month`, 
      icon: 'clients',
      trendUp: data.clientsChangeCount >= 0,
    },
    { 
      title: 'Pending Invoices', 
      value: data.pendingAmount, 
      description: `${data.pendingCount} outstanding invoices`, 
      icon: 'invoices',
      trendUp: false,
      prefix: '$',
    },
  ];

  const quickActions = [
    { title: 'New Client', href: `/${workspaceSlug}/clients?add=true`, desc: 'Add client contact card', icon: 'clients', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20' },
    { title: 'New Proposal', href: `/${workspaceSlug}/proposals/new`, desc: 'Draft freelancer pitch', icon: 'proposals', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20' },
    { title: 'New Project', href: `/${workspaceSlug}/projects/new`, desc: 'Launch project dashboard', icon: 'projects', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-450 dark:border-emerald-500/20' },
    { title: 'New Invoice', href: `/${workspaceSlug}/invoices?create=true`, desc: 'Generate billing statement', icon: 'invoices', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-450 dark:border-amber-500/20' },
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
      {/* Greeting Card with Entrance Animation */}
      <AnimatedGreeting 
        userName={session.user.name || ''} 
        activeProjectsCount={data.activeProjectsCount} 
        pendingCount={data.pendingCount} 
      />

      {/* KPI Cards Row with Staggered Entrance & Count-up */}
      <AnimatedKPIGrid kpis={kpis} />

      {/* Quick Actions Row with Staggered Entrance */}
      <AnimatedQuickActions quickActions={quickActions} workspaceSlug={workspaceSlug} />

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart Card */}
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col">
          <div className="border-b border-zinc-100 dark:border-zinc-850/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Revenue Over Time</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Monthly rolling billing totals (last 12 months)</p>
          </div>
          <div className="flex-1">
            <RevenueChart data={data.monthlyRevenueTrend} />
          </div>
        </Card>

        {/* Project Statistics Chart Card */}
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col">
          <div className="border-b border-zinc-100 dark:border-zinc-850/60 pb-3 mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight font-heading">Projects by Status</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-normal">Total projects count distribution across statuses</p>
          </div>
          <div className="flex-1">
            <ProjectStatusChart data={data.projectStatusDistribution} />
          </div>
        </Card>
      </div>

      {/* Workload & Recent Activity with Slide-in Entrance */}
      <AnimatedWorkloadActivity 
        hoursLogged={data.hoursLogged}
        targetHours={targetHours}
        loggedProgressPercent={loggedProgressPercent}
        activeTasksCount={data.activeTasksCount}
        upcomingMilestone={data.upcomingMilestone}
        recentActivities={data.recentActivities}
        activityIcons={activityIcons}
      />
    </div>
  );
}
