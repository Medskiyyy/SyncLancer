import prisma from '@/lib/prisma';
import { Invoice, InvoiceItem, InvoiceStatus } from '@prisma/client';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice';
import { Decimal } from '@prisma/client/runtime/library';

export class InvoiceRepository {
  async findById(id: string) {
    return prisma.invoice.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: true,
        client: true,
        project: true,
      },
    });
  }

  async listByProjectId(projectId: string) {
    return prisma.invoice.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      include: {
        items: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listByWorkspaceId(workspaceId: string) {
    return prisma.invoice.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        items: true,
        client: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(workspaceId: string, data: CreateInvoiceInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Generate sequential invoice number
      const year = new Date().getFullYear();
      const count = await tx.invoice.count({
        where: {
          workspaceId,
          createdAt: {
            gte: new Date(`${year}-01-01T00:00:00.000Z`),
            lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      });
      const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

      // 2. Calculate totals
      let subtotal = 0;
      const itemsData = data.items.map((item) => {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        return {
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: new Decimal(item.unitPrice),
          totalPrice: new Decimal(itemTotal),
        };
      });

      const taxAmount = subtotal * (data.taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      // 3. Create Invoice & nested Items
      return tx.invoice.create({
        data: {
          workspaceId,
          clientId: data.clientId,
          projectId: data.projectId ?? null,
          invoiceNumber,
          currency: data.currency,
          subtotal: new Decimal(subtotal),
          taxAmount: new Decimal(taxAmount),
          totalAmount: new Decimal(totalAmount),
          dueDate: data.dueDate,
          status: InvoiceStatus.DRAFT,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          client: true,
          project: true,
        },
      });
    });
  }

  async update(id: string, data: UpdateInvoiceInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) {
        throw new Error('Invoice not found');
      }

      // If items or taxRate is provided, recalculate totals
      let subtotal = Number(existing.subtotal);
      let taxRate = data.taxRate !== undefined ? data.taxRate : 0; // default tax rate if not changed, wait
      // Actually, if existing items exist, we recalculate from them if no items input is provided,
      // but if items input IS provided, we replace items.
      
      const updateData: any = {};
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.status !== undefined) updateData.status = data.status;

      if (data.items !== undefined || data.taxRate !== undefined) {
        let currentItems = existing.items;
        let activeTaxRate = data.taxRate !== undefined ? data.taxRate : (existing.taxAmount.toNumber() / existing.subtotal.toNumber()) * 100 || 0;
        
        // Handle division by zero warning
        if (existing.subtotal.toNumber() === 0) {
          activeTaxRate = 0;
        }

        if (data.items !== undefined) {
          // Delete old items
          await tx.invoiceItem.deleteMany({
            where: { invoiceId: id },
          });

          // Calculate new subtotal
          subtotal = 0;
          const itemsData = data.items.map((item) => {
            const itemTotal = item.quantity * item.unitPrice;
            subtotal += itemTotal;
            return {
              invoiceId: id,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: new Decimal(item.unitPrice),
              totalPrice: new Decimal(itemTotal),
            };
          });

          // Create new items
          await tx.invoiceItem.createMany({
            data: itemsData,
          });
        }

        const taxAmount = subtotal * (activeTaxRate / 100);
        const totalAmount = subtotal + taxAmount;

        updateData.subtotal = new Decimal(subtotal);
        updateData.taxAmount = new Decimal(taxAmount);
        updateData.totalAmount = new Decimal(totalAmount);
      }

      return tx.invoice.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          client: true,
          project: true,
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
