import { FileRepository } from '../repositories/file-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { validateFile, MAX_FILE_SIZE } from '../schemas/file';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export class FileService {
  private fileRepository: FileRepository;
  private workspaceService: WorkspaceService;
  private bucketName = 'synclancer-files';

  constructor() {
    this.fileRepository = new FileRepository();
    this.workspaceService = new WorkspaceService();
  }

  private async ensureBucketExists() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === this.bucketName);
      if (!exists) {
        await supabase.storage.createBucket(this.bucketName, {
          public: true,
        });
      }
    } catch (e) {
      console.warn('Could not verify/create Supabase bucket:', e);
    }
  }

  async getFilesByProjectId(projectId: string, workspaceId: string, userId: string) {
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

    return this.fileRepository.listByProjectId(projectId);
  }

  async uploadFile(
    workspaceId: string,
    userId: string,
    projectId: string | null,
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
    fileSize: number
  ) {
    // 1. Check workspace membership
    const membership = await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    if (membership.role === Role.CLIENT) {
      const clientUser = await prisma.clientUser.findFirst({
        where: { userId },
      });
      if (!clientUser) {
        throw new Error('Access denied: Client profile not found for this user.');
      }
      if (!projectId) {
        throw new Error('Access denied: Project ID is required for client uploads.');
      }
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          clientId: clientUser.clientId,
          workspaceId,
          deletedAt: null,
        },
      });
      if (!project) {
        throw new Error('Access denied: You can only upload files to your own projects.');
      }
    }

    // 2. Validate file size and type constraints
    validateFile(fileName, fileSize, fileType);

    // 3. Subscription/Limit check (Free plan: 1GB max)
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    if (workspace.plan === 'FREE') {
      const currentUsage = await this.fileRepository.getTotalStorageUsed(workspaceId);
      const limit = 1024 * 1024 * 1024; // 1GB in bytes
      if (currentUsage + fileSize > limit) {
        throw new Error('Workspace storage limit reached (max 1GB on Free plan). Please upgrade to Pro.');
      }
    }

    // 4. If projectId is provided, check if it belongs to workspace
    if (projectId) {
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
    }

    // 5. Ensure bucket is initialized
    await this.ensureBucketExists();

    // 6. Generate storage path
    const fileId = crypto.randomUUID();
    // Sanitize file name to prevent encoding issues in storage paths
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${workspaceId}/${projectId || 'global'}/${fileId}-${cleanFileName}`;

    // 7. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(this.bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: fileType,
        duplex: 'half',
      } as any);

    if (uploadError) {
      throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
    }

    // 8. Create file record in Database
    return this.fileRepository.create({
      workspaceId,
      projectId,
      uploadedBy: userId,
      fileName,
      fileType,
      fileSize,
      storagePath,
    });
  }

  async getFileDownloadUrl(id: string, workspaceId: string, userId: string) {
    const membership = await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    const file = await this.fileRepository.findById(id);
    if (!file || file.workspaceId !== workspaceId || file.deletedAt) {
      throw new Error('File not found or does not belong to this workspace.');
    }

    if (membership.role === Role.CLIENT) {
      const clientUser = await prisma.clientUser.findFirst({
        where: { userId },
      });
      if (!clientUser) {
        throw new Error('Access denied: Client profile not found for this user.');
      }
      if (!file.projectId) {
        throw new Error('Access denied: You do not have permission to view global workspace files.');
      }
      const project = await prisma.project.findFirst({
        where: {
          id: file.projectId,
          clientId: clientUser.clientId,
          workspaceId,
          deletedAt: null,
        },
      });
      if (!project) {
        throw new Error('Access denied: You do not have permission to access files from this project.');
      }
    }

    // Generate signed URL (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(file.storagePath, 3600);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate download URL: ${error?.message || 'Unknown error'}`);
    }

    return data.signedUrl;
  }

  async deleteFile(id: string, workspaceId: string, userId: string) {
    // Only the workspace OWNER can delete files
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const file = await this.fileRepository.findById(id);
    if (!file || file.workspaceId !== workspaceId || file.deletedAt) {
      throw new Error('File not found or does not belong to this workspace.');
    }

    // 1. Remove from Supabase Storage
    const { error: removeError } = await supabase.storage
      .from(this.bucketName)
      .remove([file.storagePath]);

    if (removeError) {
      console.warn(`Warning: Failed to delete object from Supabase Storage: ${removeError.message}`);
    }

    // 2. Soft delete from Database
    return this.fileRepository.delete(id);
  }

  async getWorkspaceStorageUsage(workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    const currentUsage = await this.fileRepository.getTotalStorageUsed(workspaceId);
    const limit = workspace.plan === 'FREE' ? 1024 * 1024 * 1024 : Infinity;

    return {
      usedBytes: currentUsage,
      limitBytes: limit,
      plan: workspace.plan,
    };
  }
}
