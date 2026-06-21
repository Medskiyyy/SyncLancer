import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  default: {
    client: { findFirst: vi.fn() },
    clientUser: { findMany: vi.fn() },
    project: { findFirst: vi.fn() },
  },
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/features/notifications/services/notification-service', () => {
  const mock = vi.fn();
  mock.prototype.createNotification = vi.fn().mockResolvedValue(undefined);
  return { NotificationService: mock };
});

vi.mock('@/features/workspace/services/workspace-service', () => {
  const mock = vi.fn();
  mock.prototype.validateWorkspaceAccess = vi.fn().mockResolvedValue({ role: 'OWNER' });
  mock.prototype.getWorkspaceById = vi.fn().mockResolvedValue({
    id: 'ws-1',
    slug: 'test-ws',
    name: 'Test Workspace',
    ownerId: 'user-1',
  });
  return { WorkspaceService: mock };
});

vi.mock('@/features/invoices/repositories/invoice-repository', () => {
  const mock = vi.fn();
  mock.prototype.findById = vi.fn();
  mock.prototype.listByWorkspaceId = vi.fn();
  mock.prototype.listByProjectId = vi.fn();
  mock.prototype.create = vi.fn();
  mock.prototype.update = vi.fn();
  mock.prototype.delete = vi.fn();
  return { InvoiceRepository: mock };
});

import { InvoiceService } from '../invoice-service';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceRepository } from '@/features/invoices/repositories/invoice-repository';
import { NotificationService } from '@/features/notifications/services/notification-service';

describe('InvoiceService', () => {
  let service: InvoiceService;

  const WORKSPACE_ID = 'ws-1';
  const USER_ID = 'user-1';
  const INVOICE_ID = 'inv-1';

  const repo = () => (InvoiceRepository as ReturnType<typeof vi.fn>).mock.results.at(-1)!.value;
  const notifications = () => (NotificationService as ReturnType<typeof vi.fn>).mock.results.at(-1)!.value;

  const buildInvoice = (overrides = {}) => ({
    id: INVOICE_ID,
    workspaceId: WORKSPACE_ID,
    invoiceNumber: 'INV-001',
    status: InvoiceStatus.DRAFT,
    currency: 'USD',
    totalAmount: 1000,
    dueDate: new Date('2025-12-31'),
    clientId: 'client-1',
    client: { companyName: 'Acme Corp', primaryEmail: 'acme@example.com' },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvoiceService();
  });

  // ─── getInvoiceById ───────────────────────────
  describe('getInvoiceById', () => {
    it('returns null when invoice belongs to a different workspace', async () => {
      repo().findById.mockResolvedValue(buildInvoice({ workspaceId: 'other-ws' }));
      const result = await service.getInvoiceById(INVOICE_ID, WORKSPACE_ID, USER_ID);
      expect(result).toBeNull();
    });

    it('returns the invoice for correct workspace', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      const result = await service.getInvoiceById(INVOICE_ID, WORKSPACE_ID, USER_ID);
      expect(result?.id).toBe(INVOICE_ID);
    });
  });

  // ─── createInvoice ────────────────────────────
  describe('createInvoice', () => {
    const baseInput = {
      clientId: 'client-1',
      dueDate: new Date(),
      currency: 'USD',
      taxRate: 0,
      items: [{ name: 'Service', description: '', quantity: 1, unitPrice: 1000 }],
    };

    it('throws when client not in workspace', async () => {
      (prisma.client.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      await expect(service.createInvoice(WORKSPACE_ID, USER_ID, baseInput)).rejects.toThrow('Client not found');
    });

    it('creates invoice when client exists', async () => {
      (prisma.client.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'client-1' });
      repo().create.mockResolvedValue(buildInvoice());

      const result = await service.createInvoice(WORKSPACE_ID, USER_ID, baseInput);
      expect(result.id).toBe(INVOICE_ID);
    });

    it('throws when projectId supplied but project not in workspace', async () => {
      (prisma.client.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'client-1' });
      (prisma.project.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        service.createInvoice(WORKSPACE_ID, USER_ID, { ...baseInput, projectId: 'proj-999' })
      ).rejects.toThrow('Project not found');
    });
  });

  // ─── updateInvoice ────────────────────────────
  describe('updateInvoice', () => {
    it('throws when invoice belongs to different workspace', async () => {
      repo().findById.mockResolvedValue(buildInvoice({ workspaceId: 'other' }));
      await expect(service.updateInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID, {})).rejects.toThrow('Invoice not found');
    });

    it('updates and returns invoice', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      repo().update.mockResolvedValue(buildInvoice({ status: InvoiceStatus.SENT }));

      const result = await service.updateInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID, { status: InvoiceStatus.SENT });
      expect(result.status).toBe(InvoiceStatus.SENT);
    });
  });

  // ─── sendInvoice ─────────────────────────────
  describe('sendInvoice', () => {
    it('throws when invoice not found', async () => {
      repo().findById.mockResolvedValue(null);
      await expect(service.sendInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID)).rejects.toThrow('Invoice not found');
    });

    it('marks SENT and sends email', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      repo().update.mockResolvedValue(buildInvoice({ status: InvoiceStatus.SENT }));
      (prisma.clientUser.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await service.sendInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID);

      expect(result.status).toBe(InvoiceStatus.SENT);
      expect(repo().update).toHaveBeenCalledWith(INVOICE_ID, { status: InvoiceStatus.SENT });
      expect(sendEmail).toHaveBeenCalledOnce();
    });

    it('creates in-app notifications for each client portal user', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      repo().update.mockResolvedValue(buildInvoice({ status: InvoiceStatus.SENT }));
      (prisma.clientUser.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { userId: 'portal-user-1' },
        { userId: 'portal-user-2' },
      ]);

      await service.sendInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID);

      expect(notifications().createNotification).toHaveBeenCalledTimes(2);
    });
  });

  // ─── markAsPaid ──────────────────────────────
  describe('markAsPaid', () => {
    it('marks PAID and sends receipt email', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      repo().update.mockResolvedValue(buildInvoice({ status: InvoiceStatus.PAID }));

      const result = await service.markAsPaid(INVOICE_ID, WORKSPACE_ID, USER_ID);

      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(sendEmail).toHaveBeenCalledOnce();
    });

    it('notifies the workspace owner', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      repo().update.mockResolvedValue(buildInvoice({ status: InvoiceStatus.PAID }));

      await service.markAsPaid(INVOICE_ID, WORKSPACE_ID, USER_ID);

      expect(notifications().createNotification).toHaveBeenCalledWith(
        'user-1', // ownerId from mocked workspace
        'Invoice Paid',
        expect.stringContaining('INV-001')
      );
    });
  });

  // ─── deleteInvoice ───────────────────────────
  describe('deleteInvoice', () => {
    it('throws when invoice belongs to different workspace', async () => {
      repo().findById.mockResolvedValue(buildInvoice({ workspaceId: 'other' }));
      await expect(service.deleteInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID)).rejects.toThrow('Invoice not found');
    });

    it('deletes and returns the invoice', async () => {
      repo().findById.mockResolvedValue(buildInvoice());
      repo().delete.mockResolvedValue({ id: INVOICE_ID });

      const result = await service.deleteInvoice(INVOICE_ID, WORKSPACE_ID, USER_ID);
      expect(result.id).toBe(INVOICE_ID);
      expect(repo().delete).toHaveBeenCalledWith(INVOICE_ID);
    });
  });
});
