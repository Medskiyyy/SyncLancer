'use server';

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
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get download URL' };
  }
}

export async function deleteFileAction(id: string, workspaceId: string, projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await fileService.deleteFile(id, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete file' };
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
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get storage usage' };
  }
}
