import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FolderKanban, 
  Receipt, 
  FolderOpen, 
  Download, 
  ExternalLink,
  Briefcase,
  Calendar,
  AlertCircle
} from 'lucide-react';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ClientPortalDashboardPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  // Validate workspace membership
  try {
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);
  } catch (error) {
    redirect('/');
  }

  // Look up client relationship
  const clientUser = await prisma.clientUser.findFirst({
    where: { userId: session.user.id },
    include: {
      client: true,
    },
  });

  if (!clientUser || clientUser.client.workspaceId !== workspace.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Access Denied</h2>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-md">
          Your user profile is not linked to any client accounts in this workspace. Please contact the workspace administrator to link your account.
        </p>
      </div>
    );
  }

  const client = clientUser.client;

  // Query projects for this client
  const projects = await prisma.project.findMany({
    where: {
      clientId: client.id,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      milestones: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Query invoices for this client
  const invoices = await prisma.invoice.findMany({
    where: {
      clientId: client.id,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Query recent files for client's projects
  const projectIds = projects.map((p) => p.id);
  const files = projectIds.length > 0 ? await prisma.file.findMany({
    where: {
      projectId: { in: projectIds },
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  }) : [];

  // Metrics
  const activeProjectsCount = projects.filter((p) => p.status === 'ACTIVE').length;
  
  const outstandingBalance = invoices
    .filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

  const totalFilesCount = projectIds.length > 0 ? await prisma.file.count({
    where: {
      projectId: { in: projectIds },
      deletedAt: null,
    },
  }) : 0;

  // Format currency helper
  const formatCurrency = (amount: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200',
    SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-250',
    OVERDUE: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
    CANCELLED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
          Welcome to your Client Portal, {session.user.name || 'Representative'}!
        </h1>
        <p className="text-sm text-zinc-500 mt-1.5">
          Access project timelines, track progress, review shared files, and view or download invoices for{' '}
          <strong className="text-zinc-800 dark:text-zinc-200">{client.companyName}</strong>.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500">Active Projects</CardTitle>
            <FolderKanban className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {activeProjectsCount}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Out of {projects.length} total projects</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500">Outstanding Balance</CardTitle>
            <Receipt className="h-4.5 w-4.5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 text-rose-650 dark:text-rose-455">
              {formatCurrency(outstandingBalance)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Awaiting your payment</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-zinc-500">Files Shared</CardTitle>
            <FolderOpen className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {totalFilesCount}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Project resources & deliverables</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Projects & Invoices */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Projects Section */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-indigo-500" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No active projects assigned to your account.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors">
                    <div className="space-y-1 pr-4 min-w-0">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">
                        {project.name}
                      </h3>
                      <p className="text-[10px] text-zinc-450 truncate max-w-sm">
                        {project.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" /> Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        <span>&bull;</span>
                        <span>{project.milestones.length} milestones</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1">
                          <div className="w-14 bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400">{project.progress}%</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-bold tracking-wider uppercase px-1.5 border py-0 ${STATUS_COLORS[project.status] || ''}`}>
                          {project.status}
                        </Badge>
                      </div>
                      <Link href={`/${workspaceSlug}/portal/projects/${project.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices Section */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Receipt className="h-4.5 w-4.5 text-rose-500" /> Recent Invoices
            </CardTitle>
            <Link href={`/${workspaceSlug}/portal/invoices`} className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No invoices issued for your account.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {invoice.invoiceNumber}
                        </span>
                        <Badge variant="outline" className={`text-[8px] font-black uppercase px-1 border tracking-wide ${STATUS_COLORS[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </span>
                      <a 
                        href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspace.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shared Files Panel */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-emerald-500" /> Recent Files
          </CardTitle>
          <Link href={`/${workspaceSlug}/portal/files`} className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No files shared for your projects.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {files.map((file) => (
                <div key={file.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <FolderOpen className="h-4 w-4 text-zinc-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-md">{file.fileName}</div>
                      <div className="text-[9px] text-zinc-450 mt-0.5">
                        {file.fileType.toUpperCase()} &bull; {new Intl.NumberFormat('en', { notation: 'compact', style: 'unit', unit: 'byte' }).format(Number(file.fileSize))} &bull; Shared {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={`/api/v1/files/${file.id}?workspaceId=${workspace.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
