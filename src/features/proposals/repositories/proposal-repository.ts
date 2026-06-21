import prisma from '@/lib/prisma';
import { Proposal, ProposalItem, ProposalStatus } from '@prisma/client';
import { CreateProposalInput, UpdateProposalInput } from '../schemas/proposal';
import { Decimal } from '@prisma/client/runtime/library';

export class ProposalRepository {
  async findById(id: string) {
    return prisma.proposal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: true,
        client: true,
      },
    });
  }

  async listByWorkspaceId(workspaceId: string) {
    return prisma.proposal.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(workspaceId: string, data: CreateProposalInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Generate sequential proposal number
      const year = new Date().getFullYear();
      const count = await tx.proposal.count({
        where: {
          workspaceId,
          createdAt: {
            gte: new Date(`${year}-01-01T00:00:00.000Z`),
            lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      });
      const proposalNumber = `PROP-${year}-${(count + 1).toString().padStart(4, '0')}`;

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

      // 3. Create Proposal & Items
      return tx.proposal.create({
        data: {
          workspaceId,
          clientId: data.clientId,
          proposalNumber,
          title: data.title,
          description: data.description,
          currency: data.currency,
          subtotal: new Decimal(subtotal),
          taxAmount: new Decimal(taxAmount),
          totalAmount: new Decimal(totalAmount),
          expiresAt: data.expiresAt,
          status: ProposalStatus.DRAFT,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          client: true,
        },
      });
    });
  }

  async update(id: string, data: UpdateProposalInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.proposal.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) {
        throw new Error('Proposal not found');
      }

      if (existing.status !== ProposalStatus.DRAFT) {
        throw new Error('Only draft proposals can be edited.');
      }

      // Calculate totals if items or taxRate changes
      let subtotal = Number(existing.subtotal);
      let taxRate = 0;
      
      // Attempt to infer tax rate if not provided
      if (Number(existing.subtotal) > 0) {
        taxRate = (Number(existing.taxAmount) / Number(existing.subtotal)) * 100;
      }
      if (data.taxRate !== undefined) {
        taxRate = data.taxRate;
      }

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;

      // If items are provided, delete old and create new ones
      if (data.items !== undefined) {
        // Delete existing items
        await tx.proposalItem.deleteMany({
          where: { proposalId: id },
        });

        subtotal = 0;
        const itemsData = data.items.map((item) => {
          const itemTotal = item.quantity * item.unitPrice;
          subtotal += itemTotal;
          return {
            proposalId: id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            totalPrice: new Decimal(itemTotal),
          };
        });

        // Insert new items
        await tx.proposalItem.createMany({
          data: itemsData,
        });
      }

      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      updateData.subtotal = new Decimal(subtotal);
      updateData.taxAmount = new Decimal(taxAmount);
      updateData.totalAmount = new Decimal(totalAmount);

      return tx.proposal.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          client: true,
        },
      });
    });
  }

  async updateStatus(id: string, status: ProposalStatus): Promise<Proposal> {
    return prisma.proposal.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        client: true,
      },
    });
  }

  async softDelete(id: string): Promise<Proposal> {
    return prisma.proposal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
