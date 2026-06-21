import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ProjectService } from '@/features/projects/services/project-service';
import { ClientService } from '@/features/clients/services/client-service';
import { ProjectBuilder } from '@/features/projects/components/project-builder';
import { Role, ProjectStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

const workspaceService = new WorkspaceService();
const projectService = new ProjectService();
const clientService = new ClientService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function NewProjectPage({ params }: PageProps) {
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
    // Only workspace owners can create projects
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id, [Role.OWNER]);
  } catch (error) {
    redirect(`/${workspaceSlug}/projects`);
  }

  // Fetch data needed for project builder
  const clients = await clientService.getClients(workspace.id, session.user.id);
  const templates = await projectService.getTemplates(workspace.id, session.user.id);
  
  const activeProjectsCount = await prisma.project.count({
    where: {
      workspaceId: workspace.id,
      status: ProjectStatus.ACTIVE,
      deletedAt: null,
    },
  });

  return (
    <ProjectBuilder
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
      clients={clients}
      templates={templates}
      activeProjectsCount={activeProjectsCount}
      plan={workspace.plan}
    />
  );
}
