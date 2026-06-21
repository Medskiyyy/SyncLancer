import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/features/analytics/components/revenue-chart';
import { DollarSign, FolderKanban, Users, Receipt, Calendar, Clock, CheckSquare } from 'lucide-react';

export default async function WorkspaceDashboardPage() {
  const kpis = [
    { title: 'Total Revenue', value: '$14,500', description: '+12% from last month', icon: DollarSign },
    { title: 'Active Projects', value: '3', description: '2 on track, 1 in review', icon: FolderKanban },
    { title: 'Active Clients', value: '5', description: 'Across 3 industries', icon: Users },
    { title: 'Pending Invoices', value: '$2,400', description: '2 invoices outstanding', icon: Receipt },
  ];

  const activities = [
    { text: 'Invoice #INV-2026-004 sent to Pt ABC', time: '2 hours ago', type: 'invoice' },
    { text: 'Milestone "API Integration" completed in Website Dev', time: '1 day ago', type: 'milestone' },
    { text: 'New Lead "Acme Corp" converted to Client', time: '3 days ago', type: 'lead' },
    { text: 'Proposal "Mobile Design" approved by Acme Corp', time: '4 days ago', type: 'proposal' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here is a summary of your freelance business performance.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics & Workload */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Revenue Chart Card */}
        <Card className="md:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly billing growth in current fiscal year</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        {/* Workload Card */}
        <Card className="md:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Workload & Progress</CardTitle>
            <CardDescription>Track weekly targets and upcoming tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">18.5 Hours Logged</div>
                <div className="text-xs text-muted-foreground mt-0.5">Target: 40 hours this week</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-primary" style={{ width: '46%' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-medium">8 Active Tasks</div>
                <div className="text-xs text-muted-foreground mt-0.5">3 in progress, 2 in review</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-medium">Upcoming Milestone</div>
                <div className="text-xs text-muted-foreground mt-0.5">Website Launch (Due in 3 days)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Updates across CRM, Projects, and Invoicing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-zinc-200 pl-4 space-y-6 dark:border-zinc-800">
            {activities.map((act, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-zinc-400 dark:border-zinc-900" />
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{act.text}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{act.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
