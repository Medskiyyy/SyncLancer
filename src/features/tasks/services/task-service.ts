import { TaskRepository } from '../repositories/task-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task';
import { Role, TaskStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export class TaskService {
  private taskRepository: TaskRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getTasksByProjectId(projectId: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
        deletedAt: null,
      },
    });
    if (!project) {
      throw new Error('Project not found or does not belong to this workspace.');
    }

    return this.taskRepository.listByProjectId(projectId);
  }

  async createTask(workspaceId: string, userId: string, input: CreateTaskInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const project = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        workspaceId,
        deletedAt: null,
      },
    });
    if (!project) {
      throw new Error('Project not found or does not belong to this workspace.');
    }

    return this.taskRepository.create(input);
  }

  async updateTask(id: string, workspaceId: string, userId: string, input: UpdateTaskInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const task = await this.taskRepository.findById(id);
    if (!task || task.project.workspaceId !== workspaceId) {
      throw new Error('Task not found or does not belong to this workspace.');
    }

    const oldMilestoneId = task.milestoneId;
    const updatedTask = await this.taskRepository.update(id, input);

    // Sync status for new milestone
    if (updatedTask.milestoneId) {
      await this.syncMilestoneStatus(updatedTask.milestoneId);
    }
    // Also sync old milestone if it was changed
    if (oldMilestoneId && oldMilestoneId !== updatedTask.milestoneId) {
      await this.syncMilestoneStatus(oldMilestoneId);
    }

    return updatedTask;
  }

  async updateTaskStatus(id: string, workspaceId: string, userId: string, status: TaskStatus) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    const task = await this.taskRepository.findById(id);
    if (!task || task.project.workspaceId !== workspaceId) {
      throw new Error('Task not found or does not belong to this workspace.');
    }

    const updatedTask = await this.taskRepository.updateStatus(id, status);

    // Sync Milestone status
    if (updatedTask.milestoneId) {
      await this.syncMilestoneStatus(updatedTask.milestoneId);
    }

    return updatedTask;
  }

  private async syncMilestoneStatus(milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { tasks: true }
    });

    if (milestone) {
      const tasks = milestone.tasks;
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter(t => t.status === 'DONE').length;
      const todoOrBacklogTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'BACKLOG').length;

      let newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
      if (totalTasks > 0) {
        if (doneTasks === totalTasks) {
          newStatus = 'COMPLETED';
        } else if (todoOrBacklogTasks === totalTasks) {
          newStatus = 'NOT_STARTED';
        } else {
          newStatus = 'IN_PROGRESS';
        }
      }

      if (milestone.status !== newStatus) {
        await prisma.milestone.update({
          where: { id: milestone.id },
          data: { status: newStatus }
        });
      }
    }
  }

  async deleteTask(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const task = await this.taskRepository.findById(id);
    if (!task || task.project.workspaceId !== workspaceId) {
      throw new Error('Task not found or does not belong to this workspace.');
    }

    const milestoneId = task.milestoneId;
    await this.taskRepository.delete(id);

    if (milestoneId) {
      await this.syncMilestoneStatus(milestoneId);
    }

    return { success: true };
  }
}
