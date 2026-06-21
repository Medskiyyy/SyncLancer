import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { FileManager } from '@/features/files/components/file-manager';
import prisma from '@/lib/prisma';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceFilesPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  // Verify access
  await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);

  // Retrieve files
  const initialFiles = await prisma.file.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: {
        select: {
          fullName: true,
        },
      },
    },
  });

  // Map BigInt to Number to avoid serialization errors
  const mappedFiles = initialFiles.map((file) => ({
    ...file,
    fileSize: Number(file.fileSize),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-550">Files</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage all files uploaded across projects in this workspace.
        </p>
      </div>

      <FileManager
        projectId=""
        workspaceId={workspace.id}
        initialFiles={mappedFiles}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
