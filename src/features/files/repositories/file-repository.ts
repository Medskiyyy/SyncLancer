import prisma from '@/lib/prisma';

export interface CreateFileRepoInput {
  workspaceId: string;
  projectId?: string | null;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
}

export class FileRepository {
  private mapFile(file: any) {
    if (!file) return null;
    return {
      ...file,
      fileSize: Number(file.fileSize),
    };
  }

  async findById(id: string) {
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        workspace: true,
        project: true,
        uploader: true,
      },
    });
    return this.mapFile(file);
  }

  async listByProjectId(projectId: string) {
    const files = await prisma.file.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: true,
      },
    });
    return files.map(f => this.mapFile(f));
  }

  async listByWorkspaceId(workspaceId: string) {
    const files = await prisma.file.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: true,
      },
    });
    return files.map(f => this.mapFile(f));
  }

  async create(data: CreateFileRepoInput) {
    const file = await prisma.file.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId ?? null,
        uploadedBy: data.uploadedBy,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: BigInt(data.fileSize),
        storagePath: data.storagePath,
      },
      include: {
        uploader: true,
      },
    });
    return this.mapFile(file);
  }

  async delete(id: string) {
    const file = await prisma.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    return this.mapFile(file);
  }

  async getTotalStorageUsed(workspaceId: string): Promise<number> {
    const result = await prisma.file.aggregate({
      where: {
        workspaceId,
        deletedAt: null,
      },
      _sum: {
        fileSize: true,
      },
    });
    return Number(result._sum.fileSize || BigInt(0));
  }
}
