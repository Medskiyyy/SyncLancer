import prisma from '@/lib/prisma';
import { CreateMilestoneInput, UpdateMilestoneInput } from '../schemas/milestone';

export class MilestoneRepository {
  async findById(id: string) {
    return prisma.milestone.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  async listByProjectId(projectId: string) {
    return prisma.milestone.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: CreateMilestoneInput) {
    return prisma.milestone.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description || '',
        dueDate: data.dueDate,
        status: data.status,
        sortOrder: data.sortOrder,
        progress: 0,
      },
    });
  }

  async update(id: string, data: UpdateMilestoneInput) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.progress !== undefined) updateData.progress = data.progress;

    return prisma.milestone.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.milestone.delete({
      where: { id },
    });
  }
}
