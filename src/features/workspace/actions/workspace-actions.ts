'use server';

import { auth } from '@/auth';
import { WorkspaceService } from '../services/workspace-service';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../schemas/workspace';

const workspaceService = new WorkspaceService();

export async function createWorkspaceAction(input: CreateWorkspaceInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const workspace = await workspaceService.createWorkspace(session.user.id, input);
    return { success: true, data: workspace };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create workspace' };
  }
}

export async function updateWorkspaceAction(workspaceId: string, input: UpdateWorkspaceInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const workspace = await workspaceService.updateWorkspace(workspaceId, session.user.id, input);
    return { success: true, data: workspace };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update workspace' };
  }
}

export async function deleteWorkspaceAction(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await workspaceService.deleteWorkspace(workspaceId, session.user.id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete workspace' };
  }
}
