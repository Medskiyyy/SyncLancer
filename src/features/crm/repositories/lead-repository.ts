import prisma from '@/lib/prisma';
import { Lead, LeadStatus, Client } from '@prisma/client';
import { CreateLeadInput, UpdateLeadInput } from '../schemas/lead';

export class LeadRepository {
  async findById(id: string): Promise<Lead | null> {
    return prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async listByWorkspaceId(workspaceId: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(workspaceId: string, data: CreateLeadInput): Promise<Lead> {
    return prisma.lead.create({
      data: {
        workspaceId,
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        notes: data.notes || '',
        status: LeadStatus.NEW,
      },
    });
  }

  async update(id: string, data: UpdateLeadInput): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async convertToClientTransaction(leadId: string, workspaceId: string): Promise<Client> {
    return prisma.$transaction(async (tx) => {
      // 1. Update lead status to WON
      const lead = await tx.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.WON },
      });

      // 2. Check if client company name already exists in this workspace
      const existingClient = await tx.client.findFirst({
        where: {
          workspaceId,
          companyName: lead.company,
          primaryEmail: lead.email,
          deletedAt: null,
        },
      });

      if (existingClient) {
        return existingClient;
      }

      // 3. Create the new Client
      const client = await tx.client.create({
        data: {
          workspaceId,
          companyName: lead.company,
          primaryEmail: lead.email,
          phone: lead.phone,
          notes: `Converted from Lead: ${lead.name}. Notes: ${lead.notes}`,
          archived: false,
        },
      });

      // 4. Update workspace subscription usage counts
      await tx.subscriptionUsage.update({
        where: { workspaceId },
        data: {
          clientsCount: {
            increment: 1,
          },
        },
      });

      return client;
    });
  }
}
