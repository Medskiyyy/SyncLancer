import prisma from '@/lib/prisma';
import { CreateTimeEntryInput, UpdateTimeEntryInput } from '../schemas/time-entry';

export class TimeEntryRepository {
  async findById(id: string) {
    return prisma.timeEntry.findUnique({
      where: { id },
      include: {
        project: true,
        task: true,
      },
    });
  }

  async listByProjectId(projectId: string) {
    return prisma.timeEntry.findMany({
      where: { projectId },
      orderBy: { startTime: 'desc' },
      include: {
        task: true,
      },
    });
  }

  async create(data: CreateTimeEntryInput) {
    return prisma.timeEntry.create({
      data: {
        projectId: data.projectId,
        taskId: data.taskId ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        billable: data.billable,
        notes: data.notes,
      },
      include: {
        task: true,
      },
    });
  }

  async update(id: string, data: UpdateTimeEntryInput) {
    const updateData: any = {};
    if (data.taskId !== undefined) updateData.taskId = data.taskId ?? null;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        task: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.timeEntry.delete({
      where: { id },
    });
  }
}
