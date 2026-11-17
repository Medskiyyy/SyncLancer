import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
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
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={1.75} />
        <h2 className="font-heading text-xl font-bold text-foreground">Access Denied</h2>
        <p className="max-w-md text-sm text-muted-foreground">
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
    DRAFT: 'border-border bg-secondary text-foreground',
    ACTIVE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    ON_HOLD: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    REVIEW: 'border-border bg-secondary text-foreground',
    COMPLETED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    SENT: 'border-border bg-secondary text-foreground',
    PAID: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    OVERDUE: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
    CANCELLED: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Client Portal · {client.companyName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome, {session.user.name || 'Representative'}. Review active milestones, shared deliverables, and invoice statements.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Active Projects</div>
          <div className="mt-2 font-heading text-2xl font-bold tabular-nums text-foreground">
            {activeProjectsCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Out of {projects.length} total projects</p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Outstanding Balance</div>
          <div className={`mt-2 font-heading text-2xl font-bold tabular-nums ${outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'}`}>
            {formatCurrency(outstandingBalance)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting payment</p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Shared Files</div>
          <div className="mt-2 font-heading text-2xl font-bold tabular-nums text-foreground">
            {totalFilesCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Project assets & deliverables</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
              <Briefcase className="h-4 w-4 text-brand" strokeWidth={1.75} /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No active projects assigned to your account.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40">
                    <div className="min-w-0 space-y-1 pr-4">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {project.name}
                      </h3>
                      <p className="max-w-sm truncate text-xs text-muted-foreground">
                        {project.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" /> Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>{project.milestones.length} milestones</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-brand" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{project.progress}%</span>
                        </div>
                        <Badge variant="outline" className={`px-1.5 py-0 text-[11px] font-medium ${STATUS_COLORS[project.status] || 'border-border bg-secondary text-foreground'}`}>
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

        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
              <Receipt className="h-4 w-4 text-brand" strokeWidth={1.75} /> Recent Invoices
            </CardTitle>
            <Link href={`/${workspaceSlug}/portal/invoices`} className="text-xs font-medium text-foreground underline-offset-4 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No invoices issued for your account.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {invoice.invoiceNumber}
                        </span>
                        <Badge variant="outline" className={`px-1.5 text-[11px] font-medium ${STATUS_COLORS[invoice.status] || 'border-border bg-secondary text-foreground'}`}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
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

      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <FolderOpen className="h-4 w-4 text-brand" strokeWidth={1.75} /> Recent Files
          </CardTitle>
          <Link href={`/${workspaceSlug}/portal/files`} className="text-xs font-medium text-foreground underline-offset-4 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No files shared for your projects.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3.5 text-xs transition-colors hover:bg-secondary/40">
                  <div className="flex min-w-0 items-center gap-2.5 pr-4">
                    <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="max-w-md truncate font-semibold text-foreground">{file.fileName}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {file.fileType.toUpperCase()} · {new Intl.NumberFormat('en', { notation: 'compact', style: 'unit', unit: 'byte' }).format(Number(file.fileSize))} · Shared {new Date(file.createdAt).toLocaleDateString()}
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
