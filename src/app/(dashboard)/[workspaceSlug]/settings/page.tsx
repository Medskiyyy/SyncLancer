import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { WorkspaceSettings } from '@/features/workspace/components/workspace-settings';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceSettingsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  try {
    // Only workspace owners are allowed to modify settings or subscriptions
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id, [Role.OWNER]);
  } catch (error) {
    redirect(`/${workspaceSlug}`);
  }

  // Fetch subscription usage details
  let usage = await prisma.subscriptionUsage.findUnique({
    where: { workspaceId: workspace.id },
  });

  if (!usage) {
    // Gracefully initialize tracking if missing
    usage = await prisma.subscriptionUsage.create({
      data: {
        workspaceId: workspace.id,
        activeProjectsCount: 0,
        clientsCount: 0,
        storageUsedBytes: 0,
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Workspace Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Configure profile metadata, view resource utilization, and manage subscription plans.
        </p>
      </div>

      <WorkspaceSettings
        workspace={{
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logoUrl: workspace.logoUrl,
          plan: workspace.plan,
        }}
        usage={{
          activeProjectsCount: usage.activeProjectsCount,
          clientsCount: usage.clientsCount,
          storageUsedBytes: Number(usage.storageUsedBytes),
        }}
      />
    </div>
  );
}
