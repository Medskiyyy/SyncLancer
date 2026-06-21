import { TimeEntryRepository } from '../repositories/time-entry-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateTimeEntryInput, UpdateTimeEntryInput } from '../schemas/time-entry';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';

export class TimeEntryService {
  private timeEntryRepository: TimeEntryRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.timeEntryRepository = new TimeEntryRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getTimeEntriesByProjectId(projectId: string, workspaceId: string, userId: string) {
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

    return this.timeEntryRepository.listByProjectId(projectId);
  }

  async createTimeEntry(workspaceId: string, userId: string, input: CreateTimeEntryInput) {
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

    // If a taskId is provided, verify it belongs to the same project
    if (input.taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: input.taskId,
          projectId: input.projectId,
        },
      });
      if (!task) {
        throw new Error('Task not found or does not belong to this project.');
      }
    }

    return this.timeEntryRepository.create(input);
  }

  async updateTimeEntry(id: string, workspaceId: string, userId: string, input: UpdateTimeEntryInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const entry = await this.timeEntryRepository.findById(id);
    if (!entry || entry.project.workspaceId !== workspaceId) {
      throw new Error('Time entry not found or does not belong to this workspace.');
    }

    // If taskId is changing, verify it belongs to the project
    if (input.taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: input.taskId,
          projectId: entry.projectId,
        },
      });
      if (!task) {
        throw new Error('Task not found or does not belong to this project.');
      }
    }

    return this.timeEntryRepository.update(id, input);
  }

  async deleteTimeEntry(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const entry = await this.timeEntryRepository.findById(id);
    if (!entry || entry.project.workspaceId !== workspaceId) {
      throw new Error('Time entry not found or does not belong to this workspace.');
    }

    return this.timeEntryRepository.delete(id);
  }
}
