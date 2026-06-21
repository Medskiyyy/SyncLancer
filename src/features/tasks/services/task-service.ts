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

    return this.taskRepository.update(id, input);
  }

  async updateTaskStatus(id: string, workspaceId: string, userId: string, status: TaskStatus) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    const task = await this.taskRepository.findById(id);
    if (!task || task.project.workspaceId !== workspaceId) {
      throw new Error('Task not found or does not belong to this workspace.');
    }

    return this.taskRepository.updateStatus(id, status);
  }

  async deleteTask(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const task = await this.taskRepository.findById(id);
    if (!task || task.project.workspaceId !== workspaceId) {
      throw new Error('Task not found or does not belong to this workspace.');
    }

    return this.taskRepository.delete(id);
  }
}
