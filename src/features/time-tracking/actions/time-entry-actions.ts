'use server';

import { auth } from '@/auth';
import { TimeEntryService } from '../services/time-entry-service';
import { CreateTimeEntryInput, UpdateTimeEntryInput } from '../schemas/time-entry';
import { revalidatePath } from 'next/cache';

const timeEntryService = new TimeEntryService();

export async function createTimeEntryAction(workspaceId: string, input: CreateTimeEntryInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const entry = await timeEntryService.createTimeEntry(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects/${input.projectId}`);
    return { success: true, data: entry };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create time entry' };
  }
}

export async function updateTimeEntryAction(id: string, workspaceId: string, projectId: string, input: UpdateTimeEntryInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const entry = await timeEntryService.updateTimeEntry(id, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true, data: entry };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update time entry' };
  }
}

export async function deleteTimeEntryAction(id: string, workspaceId: string, projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await timeEntryService.deleteTimeEntry(id, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete time entry' };
  }
}
