'use server';

import { getErrorMessage } from '@/lib/errors';
import { auth } from '@/auth';
import { FileService } from '../services/file-service';
import { revalidatePath } from 'next/cache';

const fileService = new FileService();

export async function getFileDownloadUrlAction(id: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const downloadUrl = await fileService.getFileDownloadUrl(id, workspaceId, session.user.id);
    return { success: true, data: downloadUrl };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to get download URL') };
  }
}

export async function deleteFileAction(id: string, workspaceId: string, projectId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await fileService.deleteFile(id, workspaceId, session.user.id);
    if (projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    }
    revalidatePath(`/[workspaceSlug]/files`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to delete file') };
  }
}

export async function getWorkspaceStorageUsageAction(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const usage = await fileService.getWorkspaceStorageUsage(workspaceId, session.user.id);
    return { success: true, data: usage };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to get storage usage') };
  }
}
