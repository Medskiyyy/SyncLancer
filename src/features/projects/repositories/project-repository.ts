import prisma from '@/lib/prisma';
import { Project, ProjectStatus } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project';
import { Decimal } from '@prisma/client/runtime/library';

export class ProjectRepository {
  async findById(id: string) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        client: true,
        milestones: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            milestone: true,
          },
        },
        timeEntries: {
          orderBy: {
            startTime: 'desc',
          },
          include: {
            task: true,
          },
        },
        files: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            uploader: true,
          },
        },
        invoices: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            items: true,
            client: true,
          },
        },
      },
    });

    if (!project) return null;

    return {
      ...project,
      files: project.files?.map((file) => ({
        ...file,
        fileSize: Number(file.fileSize),
      })) || [],
      invoices: (project as any).invoices?.map((invoice: any) => ({
        ...invoice,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        totalAmount: Number(invoice.totalAmount),
        items: invoice.items?.map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })) || [],
      })) || [],
    };
  }

  async listByWorkspaceId(workspaceId: string) {
    return prisma.project.findMany({
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

  async listTemplates(workspaceId: string) {
    return prisma.projectTemplate.findMany({
      where: {
        OR: [
          { isSystem: true },
          { workspaceId },
        ],
      },
      include: {
        milestones: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(workspaceId: string, data: CreateProjectInput) {
    return prisma.project.create({
      data: {
        workspaceId,
        clientId: data.clientId,
        name: data.name,
        description: data.description || '',
        budget: new Decimal(data.budget),
        currency: data.currency,
        startDate: data.startDate,
        deadline: data.deadline,
        status: data.status,
        progress: 0,
      },
      include: {
        client: true,
      },
    });
  }

  async update(id: string, data: UpdateProjectInput) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.budget !== undefined) updateData.budget = new Decimal(data.budget);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;

    return prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
