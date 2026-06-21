import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ClientFilesPortal } from '@/features/clients/components/client-files-portal';
import { AlertCircle } from 'lucide-react';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ClientFilesPage({ params }: PageProps) {
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

  // Fetch client projects
  const projects = await prisma.project.findMany({
    where: {
      clientId: clientUser.clientId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const projectIds = projects.map((p) => p.id);

  // Fetch all shared files for these projects
  const files = projectIds.length > 0 ? await prisma.file.findMany({
    where: {
      projectId: { in: projectIds },
      deletedAt: null,
    },
    include: {
      project: {
        select: { name: true },
      },
      uploader: {
        select: { fullName: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : [];

  // Map file sizes and schema structure
  const mappedFiles = files.map((file) => ({
    ...file,
    fileSize: Number(file.fileSize),
    uploader: file.uploader ? { fullName: file.uploader.fullName } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Shared Documents</h1>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-0.5">
          Access shared project deliverables, guidelines, assets, or upload references for the project owner.
        </p>
      </div>

      <ClientFilesPortal
        projects={projects}
        files={mappedFiles as any}
        workspaceId={workspace.id}
      />
    </div>
  );
}
