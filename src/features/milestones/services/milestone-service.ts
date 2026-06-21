import { MilestoneRepository } from '../repositories/milestone-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateMilestoneInput, UpdateMilestoneInput } from '../schemas/milestone';
import { Milestone, Role, MilestoneStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export class MilestoneService {
  private milestoneRepository: MilestoneRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.milestoneRepository = new MilestoneRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getMilestoneById(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone || milestone.project.workspaceId !== workspaceId) {
      return null;
    }
    return milestone;
  }

  async getMilestonesByProjectId(projectId: string, workspaceId: string, userId: string) {
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

    return this.milestoneRepository.listByProjectId(projectId);
  }

  async createMilestone(workspaceId: string, userId: string, input: CreateMilestoneInput) {
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

    return prisma.$transaction(async (tx) => {
      const milestone = await tx.milestone.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          description: input.description || '',
          dueDate: input.dueDate,
          status: input.status,
          sortOrder: input.sortOrder,
          progress: 0,
        },
      });

      await this.updateProjectProgress(tx, input.projectId);

      return milestone;
    });
  }

  async updateMilestone(id: string, workspaceId: string, userId: string, input: UpdateMilestoneInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone || milestone.project.workspaceId !== workspaceId) {
      throw new Error('Milestone not found or does not belong to this workspace.');
    }

    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
      if (input.progress !== undefined) updateData.progress = input.progress;

      const updatedMilestone = await tx.milestone.update({
        where: { id },
        data: updateData,
      });

      await this.updateProjectProgress(tx, milestone.projectId);

      return updatedMilestone;
    });
  }

  async deleteMilestone(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone || milestone.project.workspaceId !== workspaceId) {
      throw new Error('Milestone not found or does not belong to this workspace.');
    }

    return prisma.$transaction(async (tx) => {
      await tx.milestone.delete({
        where: { id },
      });

      await this.updateProjectProgress(tx, milestone.projectId);
    });
  }

  private async updateProjectProgress(tx: any, projectId: string) {
    const milestones = await tx.milestone.findMany({
      where: { projectId },
    });

    const total = milestones.length;
    const completed = milestones.filter((m: any) => m.status === MilestoneStatus.COMPLETED).length;
    const progress = total > 0 ? Math.floor((completed / total) * 100) : 0;

    await tx.project.update({
      where: { id: projectId },
      data: { progress },
    });
  }
}
