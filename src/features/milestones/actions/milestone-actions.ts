'use server';

import { getErrorMessage } from '@/lib/errors';
import { auth } from '@/auth';
import { MilestoneService } from '../services/milestone-service';
import { CreateMilestoneInput, UpdateMilestoneInput } from '../schemas/milestone';
import { revalidatePath } from 'next/cache';

const milestoneService = new MilestoneService();

export async function createMilestoneAction(workspaceId: string, input: CreateMilestoneInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const milestone = await milestoneService.createMilestone(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects/${input.projectId}`);
    return { success: true, data: milestone };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to create milestone') };
  }
}

export async function updateMilestoneAction(id: string, workspaceId: string, projectId: string, input: UpdateMilestoneInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const milestone = await milestoneService.updateMilestone(id, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true, data: milestone };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update milestone') };
  }
}

export async function deleteMilestoneAction(id: string, workspaceId: string, projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await milestoneService.deleteMilestone(id, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to delete milestone') };
  }
}
