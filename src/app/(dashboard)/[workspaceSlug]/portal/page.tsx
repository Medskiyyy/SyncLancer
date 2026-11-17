import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  } catch {
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
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">
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
    DRAFT: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    SENT: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    OVERDUE: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800',
    CANCELLED: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-xs">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Welcome to your Client Portal, {session.user.name || 'Representative'}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Access project timelines, track progress, review shared files, and view or download invoices for{' '}
          <strong className="text-foreground">{client.companyName}</strong>.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card shadow-xs rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active Projects</CardTitle>
            <FolderKanban className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {activeProjectsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of {projects.length} total projects</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Outstanding Balance</CardTitle>
            <Receipt className="h-4.5 w-4.5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-destructive">
              {formatCurrency(outstandingBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your payment</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Files Shared</CardTitle>
            <FolderOpen className="h-4.5 w-4.5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {totalFilesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Project resources & deliverables</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Projects & Invoices */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Projects Section */}
        <Card className="border-border shadow-xs rounded-xl bg-card overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-primary" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No active projects assigned to your account.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="space-y-1 pr-4 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate max-w-sm">
                        {project.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" /> Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        <span>&bull;</span>
                        <span>{project.milestones.length} milestones</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 bg-muted h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{project.progress}%</span>
                        </div>
                        <Badge variant="outline" className={`text-[11px] font-semibold tracking-wider uppercase px-1.5 border py-0 ${STATUS_COLORS[project.status] || ''}`}>
                          {project.status}
                        </Badge>
                      </div>
                      <Link href={`/${workspaceSlug}/portal/projects/${project.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
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
        <Card className="border-border shadow-xs rounded-xl bg-card overflow-hidden">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-4.5 w-4.5 text-primary" /> Recent Invoices
            </CardTitle>
            <Link href={`/${workspaceSlug}/portal/invoices`} className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No invoices issued for your account.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {invoice.invoiceNumber}
                        </span>
                        <Badge variant="outline" className={`text-[11px] font-semibold uppercase px-1.5 border tracking-wide ${STATUS_COLORS[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </span>
                      <a 
                        href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspace.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
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
      <Card className="border-border shadow-xs rounded-xl bg-card overflow-hidden">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-primary" /> Recent Files
          </CardTitle>
          <Link href={`/${workspaceSlug}/portal/files`} className="text-xs font-semibold text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No files shared for your projects.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {files.map((file) => (
                <div key={file.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate max-w-md">{file.fileName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {file.fileType.toUpperCase()} &bull; {new Intl.NumberFormat('en', { notation: 'compact', style: 'unit', unit: 'byte' }).format(Number(file.fileSize))} &bull; Shared {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={`/api/v1/files/${file.id}?workspaceId=${workspace.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
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
