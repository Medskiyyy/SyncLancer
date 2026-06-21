import { RecurringInvoiceRepository } from '../repositories/recurring-invoice-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { InvoiceService } from './invoice-service';
import { InvoiceRepository } from '../repositories/invoice-repository';
import { CreateRecurringInvoiceInput, UpdateRecurringInvoiceInput } from '../schemas/recurring-invoice';
import { Role, Frequency, InvoiceStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export class RecurringInvoiceService {
  private recurringInvoiceRepository: RecurringInvoiceRepository;
  private workspaceService: WorkspaceService;
  private invoiceService: InvoiceService;
  private invoiceRepository: InvoiceRepository;

  constructor() {
    this.recurringInvoiceRepository = new RecurringInvoiceRepository();
    this.workspaceService = new WorkspaceService();
    this.invoiceService = new InvoiceService();
    this.invoiceRepository = new InvoiceRepository();
  }

  async getRecurringInvoice(workspaceId: string, clientId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    return this.recurringInvoiceRepository.findByClientId(workspaceId, clientId);
  }

  async saveRecurringInvoice(
    workspaceId: string,
    clientId: string,
    userId: string,
    input: CreateRecurringInvoiceInput
  ) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    // Verify client belongs to workspace
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        workspaceId,
        deletedAt: null,
      },
    });
    if (!client) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    const existing = await this.recurringInvoiceRepository.findByClientId(workspaceId, clientId);

    if (existing) {
      return this.recurringInvoiceRepository.update(existing.id, {
        frequency: input.frequency,
        nextRunAt: input.nextRunAt,
        active: input.active,
      });
    } else {
      return this.recurringInvoiceRepository.create(workspaceId, input);
    }
  }

  async deleteRecurringInvoice(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const config = await this.recurringInvoiceRepository.findById(id);
    if (!config || config.workspaceId !== workspaceId) {
      throw new Error('Recurring invoice configuration not found or does not belong to this workspace.');
    }

    return this.recurringInvoiceRepository.delete(id);
  }

  async processRecurringInvoices(nowDate: Date) {
    const dueConfigs = await this.recurringInvoiceRepository.findDueForExecution(nowDate);
    const results = [];

    for (const config of dueConfigs) {
      try {
        // 1. Find the latest active, non-cancelled invoice for this client/workspace
        const latestInvoice = await prisma.invoice.findFirst({
          where: {
            workspaceId: config.workspaceId,
            clientId: config.clientId,
            status: { not: InvoiceStatus.CANCELLED },
            deletedAt: null,
          },
          include: {
            items: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!latestInvoice) {
          results.push({
            clientId: config.clientId,
            workspaceId: config.workspaceId,
            success: false,
            reason: 'No previous invoice found to use as template.',
          });
          continue;
        }

        if (!latestInvoice.items || latestInvoice.items.length === 0) {
          results.push({
            clientId: config.clientId,
            workspaceId: config.workspaceId,
            success: false,
            reason: 'Template invoice has no line items.',
          });
          continue;
        }

        // 2. Compute due date offset from template invoice
        // If template was created at T and due at T + D, new invoice is due at nextRunAt + D.
        const createdTime = latestInvoice.createdAt.getTime();
        const dueTime = latestInvoice.dueDate.getTime();
        const diffMs = dueTime - createdTime;
        const diffDays = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 14;

        const newDueDate = new Date(config.nextRunAt);
        newDueDate.setDate(newDueDate.getDate() + diffDays);

        // Calculate tax rate from template
        const subtotal = Number(latestInvoice.subtotal);
        const taxRate = subtotal > 0 ? (Number(latestInvoice.taxAmount) / subtotal) * 100 : 0;

        // 3. Create the cloned invoice
        const clonedInvoice = await this.invoiceRepository.create(config.workspaceId, {
          clientId: config.clientId,
          projectId: latestInvoice.projectId,
          dueDate: newDueDate,
          currency: latestInvoice.currency,
          taxRate: taxRate,
          items: latestInvoice.items.map((item) => ({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })),
        });

        // 4. Send the invoice using the workspace owner's identity to satisfy permission checks
        await this.invoiceService.sendInvoice(
          clonedInvoice.id,
          config.workspaceId,
          config.workspace.ownerId
        );

        // 5. Calculate next run date
        const nextRun = new Date(config.nextRunAt);
        if (config.frequency === Frequency.WEEKLY) {
          nextRun.setDate(nextRun.getDate() + 7);
        } else if (config.frequency === Frequency.MONTHLY) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        } else if (config.frequency === Frequency.QUARTERLY) {
          nextRun.setMonth(nextRun.getMonth() + 3);
        } else if (config.frequency === Frequency.YEARLY) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }

        // 6. Update next run date in config database
        await this.recurringInvoiceRepository.update(config.id, {
          frequency: config.frequency,
          nextRunAt: nextRun,
          active: true,
        });

        results.push({
          clientId: config.clientId,
          workspaceId: config.workspaceId,
          success: true,
          newInvoiceId: clonedInvoice.id,
          newInvoiceNumber: clonedInvoice.invoiceNumber,
          nextRunAt: nextRun,
        });
      } catch (err: any) {
        results.push({
          clientId: config.clientId,
          workspaceId: config.workspaceId,
          success: false,
          error: err.message || 'Unknown error occurred during cloning.',
        });
      }
    }

    return results;
  }
}
