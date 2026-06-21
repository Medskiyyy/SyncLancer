import { ClientRepository } from '../repositories/client-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateClientInput, UpdateClientInput } from '../schemas/client';
import { Client, ClientUser, Role } from '@prisma/client';
import prisma from '@/lib/prisma';

export class ClientService {
  private clientRepository: ClientRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.clientRepository = new ClientRepository();
    this.workspaceService = new WorkspaceService();
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

    // In a real application:
    // Send invitation email via Resend
    console.log(`Sending invitation email to ${email} for client ${client.companyName}...`);

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
