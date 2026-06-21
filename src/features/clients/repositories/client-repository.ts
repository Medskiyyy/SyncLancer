import prisma from '@/lib/prisma';
import { Client, ClientUser, Role } from '@prisma/client';
import { CreateClientInput, UpdateClientInput } from '../schemas/client';

export class ClientRepository {
  async findById(id: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        portalUsers: {
          include: {
            user: true,
          },
        },
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        proposals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async listByWorkspaceId(workspaceId: string): Promise<Client[]> {
    return prisma.client.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        projects: true,
        invoices: {
          where: { deletedAt: null },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(workspaceId: string, data: CreateClientInput): Promise<Client> {
    return prisma.client.create({
      data: {
        workspaceId,
        companyName: data.companyName,
        primaryEmail: data.primaryEmail,
        phone: data.phone,
        notes: data.notes || '',
        archived: false,
      },
    });
  }

  async update(id: string, data: UpdateClientInput): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  async archive(id: string, archived: boolean): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data: { archived },
    });
  }

  async softDelete(id: string): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async inviteClientUser(
    workspaceId: string,
    clientId: string,
    email: string,
    title: string,
  ): Promise<ClientUser> {
    return prisma.$transaction(async (tx) => {
      // 1. Check if user already exists
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create a skeleton user for the client
        user = await tx.user.create({
          data: {
            email,
            fullName: email.split('@')[0] || 'Client User',
            emailVerified: false,
          },
        });
      }

      // 2. Add as workspace member with CLIENT role
      const existingMembership = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

      if (!existingMembership) {
        await tx.workspaceMember.create({
          data: {
            workspaceId,
            userId: user.id,
            role: Role.CLIENT,
          },
        });
      }

      // 3. Link user to client entity
      const existingLink = await tx.clientUser.findUnique({
        where: {
          clientId_userId: {
            clientId,
            userId: user.id,
          },
        },
      });

      if (existingLink) {
        return existingLink;
      }

      return tx.clientUser.create({
        data: {
          clientId,
          userId: user.id,
          title,
        },
      });
    });
  }
}
