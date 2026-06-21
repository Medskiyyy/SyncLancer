import { LeadRepository } from '../repositories/lead-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateLeadInput, UpdateLeadInput } from '../schemas/lead';
import { Lead, LeadStatus, Client, Role } from '@prisma/client';
import prisma from '@/lib/prisma';

export class LeadService {
  private leadRepository: LeadRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.leadRepository = new LeadRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getLeads(workspaceId: string, userId: string): Promise<Lead[]> {
    // Multi-tenant check: User must be a member of this workspace
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    return this.leadRepository.listByWorkspaceId(workspaceId);
  }

  async createLead(workspaceId: string, userId: string, input: CreateLeadInput): Promise<Lead> {
    // RBAC: Only OWNER can manage CRM leads
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);
    return this.leadRepository.create(workspaceId, input);
  }

  async updateLead(
    leadId: string,
    workspaceId: string,
    userId: string,
    input: UpdateLeadInput,
  ): Promise<Lead> {
    // RBAC: Only OWNER can manage CRM leads
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const lead = await this.leadRepository.findById(leadId);
    if (!lead || lead.workspaceId !== workspaceId) {
      throw new Error('Lead not found or does not belong to this workspace.');
    }

    return this.leadRepository.update(leadId, input);
  }

  async updateLeadStatus(
    leadId: string,
    workspaceId: string,
    userId: string,
    status: LeadStatus,
  ): Promise<Lead> {
    // RBAC: Only OWNER can manage CRM leads
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const lead = await this.leadRepository.findById(leadId);
    if (!lead || lead.workspaceId !== workspaceId) {
      throw new Error('Lead not found or does not belong to this workspace.');
    }

    return this.leadRepository.updateStatus(leadId, status);
  }

  async deleteLead(leadId: string, workspaceId: string, userId: string): Promise<Lead> {
    // RBAC: Only OWNER can manage CRM leads
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const lead = await this.leadRepository.findById(leadId);
    if (!lead || lead.workspaceId !== workspaceId) {
      throw new Error('Lead not found or does not belong to this workspace.');
    }

    return this.leadRepository.softDelete(leadId);
  }

  async convertLeadToClient(leadId: string, workspaceId: string, userId: string): Promise<Client> {
    // RBAC: Only OWNER can convert leads
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const lead = await this.leadRepository.findById(leadId);
    if (!lead || lead.workspaceId !== workspaceId) {
      throw new Error('Lead not found or does not belong to this workspace.');
    }

    if (lead.status === LeadStatus.LOST) {
      throw new Error('Cannot convert a LOST lead to client.');
    }

    // Subscription Limit Check: Free plan limit is 5 clients
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

    return this.leadRepository.convertToClientTransaction(leadId, workspaceId);
  }
}
