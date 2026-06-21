import prisma from '@/lib/prisma';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task';
import { TaskStatus } from '@prisma/client';

export class TaskRepository {
  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        milestone: true,
      },
    });
  }

  async listByProjectId(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        milestone: true,
      },
    });
  }

  async create(data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        projectId: data.projectId,
        milestoneId: data.milestoneId ?? null,
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
      },
    });
  }

  async update(id: string, data: UpdateTaskInput) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    return prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async updateStatus(id: string, status: TaskStatus) {
    return prisma.task.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }
}
