import { serialize } from '@/lib/serialize';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ProjectService } from '@/features/projects/services/project-service';
import { ProjectDetail } from '@/features/projects/components/project-detail';

const workspaceService = new WorkspaceService();
const projectService = new ProjectService();

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
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
    // Validate workspace membership
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);
  } catch {
    redirect('/');
  }

  const project = await projectService.getProjectById(projectId, workspace.id, session.user.id);
  if (!project) {
    notFound();
  }

  return (
    <ProjectDetail
      project={serialize(project)}
      workspaceSlug={workspaceSlug}
    />
  );
}
