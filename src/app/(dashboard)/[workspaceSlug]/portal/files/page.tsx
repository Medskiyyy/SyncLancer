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
  } catch {
    redirect('/');
  }

  // Look up client relationship
  const clientUser = await prisma.clientUser.findFirst({
    where: { userId: session.user.id },
    include: { client: true },
  });

  if (!clientUser || clientUser.client.workspaceId !== workspace.id) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={1.75} />
        <h2 className="font-heading text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
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
      <div className="border-b border-border pb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Shared Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access shared project deliverables, guidelines, assets, or upload references for the project owner.
        </p>
      </div>

      <ClientFilesPortal
        projects={projects}
        files={mappedFiles}
        workspaceId={workspace.id}
      />
    </div>
  );
}
