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
  params: Promise<{ 
    workspaceSlug: string;
    projectId: string;
  }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug, projectId } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  try {
    // Only workspace owners can edit projects
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id, [Role.OWNER]);
  } catch (error) {
    redirect(`/${workspaceSlug}/projects`);
  }

  const project = await projectService.getProjectById(projectId, workspace.id, session.user.id);
  if (!project) {
    notFound();
  }

  // Fetch clients, templates and active projects count for ProjectBuilder
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
      project={project}
    />
  );
}
