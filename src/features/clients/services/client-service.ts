import { ClientRepository } from '../repositories/client-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { NotificationService } from '@/features/notifications/services/notification-service';
import { sendEmail } from '@/lib/email';
import { CreateClientInput, UpdateClientInput } from '../schemas/client';
import { Client, ClientUser, Role } from '@prisma/client';
import prisma from '@/lib/prisma';

export class ClientService {
  private clientRepository: ClientRepository;
  private workspaceService: WorkspaceService;
  private notificationService: NotificationService;

  constructor() {
    this.clientRepository = new ClientRepository();
    this.workspaceService = new WorkspaceService();
    this.notificationService = new NotificationService();
  }

  async getClients(workspaceId: string, userId: string): Promise<Client[]> {
    // Multi-tenant isolation check
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    return this.clientRepository.listByWorkspaceId(workspaceId);
  }

  async getClientById(clientId: string, workspaceId: string, userId: string): Promise<Client | null> {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    const client = await this.clientRepository.findById(clientId);
    if (!client || client.workspaceId !== workspaceId) {
      return null;
    }
    return client;
  }

  async createClient(workspaceId: string, userId: string, input: CreateClientInput): Promise<Client> {
    // RBAC check: Only OWNER can manage clients
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    // Plan limits check: Free plan limit is 5 clients
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    if (workspace.plan === 'FREE') {
      const usage = await prisma.subscriptionUsage.findUnique({
        where: { workspaceId },
      });

      if (usage && usage.clientsCount >= 5) {
        throw new Error('Client limit reached (max 5 clients on Free plan). Please upgrade to Pro.');
      }
    }

    const client = await this.clientRepository.create(workspaceId, input);

    // Update usage counts
    await prisma.subscriptionUsage.update({
      where: { workspaceId },
      data: {
        clientsCount: {
          increment: 1,
        },
      },
    });

    return client;
  }

  async updateClient(
    clientId: string,
    workspaceId: string,
    userId: string,
    input: UpdateClientInput,
  ): Promise<Client> {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const client = await this.clientRepository.findById(clientId);
    if (!client || client.workspaceId !== workspaceId) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    return this.clientRepository.update(clientId, input);
  }

  async archiveClient(
    clientId: string,
    workspaceId: string,
    userId: string,
    archived: boolean,
  ): Promise<Client> {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const client = await this.clientRepository.findById(clientId);
    if (!client || client.workspaceId !== workspaceId) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    return this.clientRepository.archive(clientId, archived);
  }

  async deleteClient(clientId: string, workspaceId: string, userId: string): Promise<Client> {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const client = await this.clientRepository.findById(clientId);
    if (!client || client.workspaceId !== workspaceId) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    const deleted = await this.clientRepository.softDelete(clientId);

    // Decrement subscription usage clients count
    await prisma.subscriptionUsage.update({
      where: { workspaceId },
      data: {
        clientsCount: {
          decrement: 1,
        },
      },
    });

    return deleted;
  }

  async inviteClientPortalUser(
    workspaceId: string,
    clientId: string,
    userId: string,
    email: string,
    title: string,
  ): Promise<ClientUser> {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const client = await this.clientRepository.findById(clientId);
    if (!client || client.workspaceId !== workspaceId) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    const clientUser = await this.clientRepository.inviteClientUser(
      workspaceId,
      clientId,
      email,
      title,
    );

    // Fetch workspace for context
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    const workspaceName = workspace?.name || 'SyncLancer';

    // 1. Create in-app notification for the invited skeleton client user
    await this.notificationService.createNotification(
      clientUser.userId,
      'Workspace Invitation',
      `You have been invited to join the Client Portal for ${workspaceName}.`
    );

    // 2. Send invitation email via Resend
    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/register?email=${encodeURIComponent(email)}`;

    try {
      await sendEmail({
        to: email,
        subject: `Invitation to join ${workspaceName} Client Portal`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-top: 0; font-family: Outfit, Inter, sans-serif;">Welcome to SyncLancer</h2>
            <p>You have been invited by <strong>${workspaceName}</strong> to join their Client Portal.</p>
            <p>Once registered, you'll be able to view active project timelines, milestones, track tasks, download invoices, and manage shared files.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${inviteUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Join Client Portal</a>
            </div>
            <p style="color: #71717a; font-size: 12px; margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
              This is an automated invitation sent on behalf of ${workspaceName}. If you have any questions, please contact them directly.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send client portal invitation email:', emailError);
    }

    return clientUser;
  }

  async getClientFiles(workspaceId: string, clientId: string, userId: string): Promise<any[]> {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    
    // Find client with projects to get their IDs
    const client = await this.clientRepository.findById(clientId);
    if (!client || client.workspaceId !== workspaceId) {
      throw new Error('Client not found or does not belong to this workspace.');
    }

    // Cast client to any because findById now includes projects relation
    const projects = (client as any).projects || [];
    const projectIds = projects.map((p: any) => p.id);
    if (projectIds.length === 0) return [];

    return prisma.file.findMany({
      where: {
        projectId: { in: projectIds },
        deletedAt: null,
      },
      include: {
        uploader: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
