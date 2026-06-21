import prisma from '@/lib/prisma';
import { RecurringInvoice } from '@prisma/client';
import { CreateRecurringInvoiceInput, UpdateRecurringInvoiceInput } from '../schemas/recurring-invoice';

export class RecurringInvoiceRepository {
  async findById(id: string) {
    return prisma.recurringInvoice.findUnique({
      where: { id },
      include: {
        workspace: true,
        client: true,
      },
    });
  }

  async findByClientId(workspaceId: string, clientId: string) {
    return prisma.recurringInvoice.findFirst({
      where: {
        workspaceId,
        clientId,
      },
    });
  }

  async listByWorkspaceId(workspaceId: string) {
    return prisma.recurringInvoice.findMany({
      where: { workspaceId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDueForExecution(nowDate: Date) {
    return prisma.recurringInvoice.findMany({
      where: {
        active: true,
        nextRunAt: {
          lte: nowDate,
        },
      },
      include: {
        workspace: true,
        client: true,
      },
    });
  }

  async create(workspaceId: string, data: CreateRecurringInvoiceInput) {
    return prisma.recurringInvoice.create({
      data: {
        workspaceId,
        clientId: data.clientId,
        frequency: data.frequency,
        nextRunAt: data.nextRunAt,
        active: data.active ?? true,
      },
      include: {
        client: true,
      },
    });
  }

  async update(id: string, data: UpdateRecurringInvoiceInput) {
    return prisma.recurringInvoice.update({
      where: { id },
      data: {
        frequency: data.frequency,
        nextRunAt: data.nextRunAt,
        active: data.active,
      },
      include: {
        client: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.recurringInvoice.delete({
      where: { id },
    });
  }
}
