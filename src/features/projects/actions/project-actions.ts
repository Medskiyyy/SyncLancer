'use server';

import { auth } from '@/auth';
import { ProjectService } from '../services/project-service';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project';
import { revalidatePath } from 'next/cache';

const projectService = new ProjectService();

export async function createProjectAction(workspaceId: string, input: CreateProjectInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const project = await projectService.createProject(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects`);
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create project' };
  }
}

export async function updateProjectAction(projectId: string, workspaceId: string, input: UpdateProjectInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const project = await projectService.updateProject(projectId, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects`);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}/edit`);
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update project' };
  }
}

export async function deleteProjectAction(projectId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await projectService.deleteProject(projectId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/projects`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete project' };
  }
}
