'use server';

import { getErrorMessage } from '@/lib/errors';
import { auth } from '@/auth';
import { TaskService } from '../services/task-service';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task';
import { TaskStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const taskService = new TaskService();

export async function createTaskAction(workspaceId: string, input: CreateTaskInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const task = await taskService.createTask(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects/${input.projectId}`);
    return { success: true, data: task };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to create task') };
  }
}

export async function updateTaskAction(id: string, workspaceId: string, projectId: string, input: UpdateTaskInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const task = await taskService.updateTask(id, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true, data: task };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update task') };
  }
}

export async function updateTaskStatusAction(id: string, workspaceId: string, projectId: string, status: TaskStatus) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const task = await taskService.updateTaskStatus(id, workspaceId, session.user.id, status);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true, data: task };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update task status') };
  }
}

export async function deleteTaskAction(id: string, workspaceId: string, projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await taskService.deleteTask(id, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to delete task') };
  }
}
