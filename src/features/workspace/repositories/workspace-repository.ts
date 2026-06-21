import prisma from '@/lib/prisma';
import { Workspace, WorkspaceMember, Role } from '@prisma/client';

export class WorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  }

  async listByUserId(userId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(ownerId: string, name: string, slug: string): Promise<Workspace> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the workspace
      const workspace = await tx.workspace.create({
        data: {
          ownerId,
          name,
          slug,
        },
      });

      // 2. Create the owner membership
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          role: Role.OWNER,
        },
      });

      // 3. Initialize subscription usage tracking
      await tx.subscriptionUsage.create({
        data: {
          workspaceId: workspace.id,
          activeProjectsCount: 0,
          clientsCount: 0,
          storageUsedBytes: 0,
        },
      });

      return workspace;
    });
  }

  async update(id: string, data: { name?: string; logoUrl?: string | null; plan?: any }): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Workspace> {
    return prisma.workspace.delete({
      where: { id },
    });
  }

  async findMembership(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }
}
