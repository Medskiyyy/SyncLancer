import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ProjectService } from '@/features/projects/services/project-service';
import { ProjectList } from '@/features/projects/components/project-list';

const workspaceService = new WorkspaceService();
const projectService = new ProjectService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ProjectsPage({ params }: PageProps) {
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
    // Validate workspace membership
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);
  } catch (error) {
    redirect('/');
  }

  const projects = await projectService.getProjects(workspace.id, session.user.id);

  return (
    <ProjectList
      initialProjects={projects}
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
    />
  );
}
