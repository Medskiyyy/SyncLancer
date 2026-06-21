import { InvoiceRepository } from '../repositories/invoice-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice';
import { Role, InvoiceStatus } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

export class InvoiceService {
  private invoiceRepository: InvoiceRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getInvoices(workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    return this.invoiceRepository.listByWorkspaceId(workspaceId);
  }

  async getInvoiceById(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice || invoice.workspaceId !== workspaceId) {
      return null;
    }
    return invoice;
  }

  async getInvoicesByProjectId(projectId: string, workspaceId: string, userId: string) {
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

    return this.invoiceRepository.listByProjectId(projectId);
  }

  async createInvoice(workspaceId: string, userId: string, input: CreateInvoiceInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    // Verify client belongs to workspace
    const client = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        workspaceId,
        deletedAt: null,
      },
    });
    if (!client) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    // Verify project belongs to workspace (if provided)
    if (input.projectId) {
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
    }

    return this.invoiceRepository.create(workspaceId, input);
  }

  async updateInvoice(id: string, workspaceId: string, userId: string, input: UpdateInvoiceInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice || invoice.workspaceId !== workspaceId) {
      throw new Error('Invoice not found or does not belong to this workspace.');
    }

    return this.invoiceRepository.update(id, input);
  }

  async deleteInvoice(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice || invoice.workspaceId !== workspaceId) {
      throw new Error('Invoice not found or does not belong to this workspace.');
    }

    return this.invoiceRepository.delete(id);
  }

  async sendInvoice(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice || invoice.workspaceId !== workspaceId) {
      throw new Error('Invoice not found or does not belong to this workspace.');
    }

    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    // 1. Update status in database
    const updatedInvoice = await this.invoiceRepository.update(id, {
      status: InvoiceStatus.SENT,
    });

    // 2. Dispatch email notification
    const client = invoice.client;
    const invoiceUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/${workspace.slug}/invoices/${invoice.id}`;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(Number(invoice.totalAmount));

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">New Invoice from ${workspace.name}</h2>
        <p>Dear ${client.companyName},</p>
        <p>You have received a new invoice <strong>${invoice.invoiceNumber}</strong> from <strong>${workspace.name}</strong>.</p>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Invoice Number:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoice.invoiceNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Total Amount Due:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2563eb; font-size: 16px;">${formattedAmount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Due Date:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoiceUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">View & Pay Invoice</a>
        </div>

        <p style="color: #71717a; font-size: 12px; margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
          This is an automated billing notification sent on behalf of ${workspace.name}. If you have any questions, please contact them directly at ${client.primaryEmail}.
        </p>
      </div>
    `;

    await sendEmail({
      to: client.primaryEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${workspace.name}`,
      html: htmlContent,
    });

    return updatedInvoice;
  }

  async markAsPaid(id: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice || invoice.workspaceId !== workspaceId) {
      throw new Error('Invoice not found or does not belong to this workspace.');
    }

    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    // 1. Update status in database
    const updatedInvoice = await this.invoiceRepository.update(id, {
      status: InvoiceStatus.PAID,
    });

    // 2. Dispatch payment receipt email
    const client = invoice.client;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(Number(invoice.totalAmount));

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #10b981; margin-top: 0;">Payment Received - Thank You!</h2>
        <p>Dear ${client.companyName},</p>
        <p>This email confirms that payment of <strong>${formattedAmount}</strong> has been successfully received for invoice <strong>${invoice.invoiceNumber}</strong>.</p>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Invoice Number:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoice.invoiceNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Amount Paid:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10b981; font-size: 16px;">${formattedAmount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e4e4e7;">
            <td style="padding: 8px 0; color: #71717a;">Payment Status:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10b981;">PAID</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">We appreciate your business!</p>

        <p style="color: #71717a; font-size: 12px; margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
          This is an automated payment confirmation sent on behalf of ${workspace.name}. If you have any questions, please contact them directly.
        </p>
      </div>
    `;

    await sendEmail({
      to: client.primaryEmail,
      subject: `Payment Received: Invoice ${invoice.invoiceNumber} - ${workspace.name}`,
      html: htmlContent,
    });

    return updatedInvoice;
  }
}
