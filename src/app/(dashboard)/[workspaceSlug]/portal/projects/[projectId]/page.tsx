import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ClientProjectPortal } from '@/features/clients/components/client-project-portal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
  }>;
}

export default async function ClientProjectDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug, projectId } = await params;
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
    include: { client: true },
  });

  if (!clientUser || clientUser.client.workspaceId !== workspace.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Access Denied</h2>
        <p className="text-sm text-zinc-550 dark:text-zinc-400">
          You do not have a client profile linked in this workspace.
        </p>
      </div>
    );
  }

  // Fetch project with milestones, tasks, files, invoices
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      clientId: clientUser.clientId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      client: true,
      milestones: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tasks: { orderBy: { createdAt: 'asc' } },
        },
      },
      invoices: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      files: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Map files uploader relation and number properties to satisfy decimal mapping
  const mappedProject = {
    ...project,
    budget: Number(project.budget),
    invoices: project.invoices.map((inv) => ({
      ...inv,
      totalAmount: Number(inv.totalAmount),
    })),
    files: project.files.map((file) => ({
      ...file,
      fileSize: Number(file.fileSize),
      uploader: file.uploader ? { fullName: file.uploader.fullName } : null,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs / Back button */}
      <div>
        <Link href={`/${workspaceSlug}/portal`}>
          <Button variant="ghost" size="sm" className="text-zinc-650 dark:text-zinc-400 font-semibold p-0 hover:bg-transparent">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <ClientProjectPortal
        project={mappedProject as any}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
