import { ProposalRepository } from '../repositories/proposal-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateProposalInput, UpdateProposalInput } from '../schemas/proposal';
import { Proposal, ProposalStatus, Project, ProjectStatus, Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ProposalService {
  private proposalRepository: ProposalRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.proposalRepository = new ProposalRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getProposals(workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    return this.proposalRepository.listByWorkspaceId(workspaceId);
  }

  async getProposalById(proposalId: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal || proposal.workspaceId !== workspaceId) {
      return null;
    }
    return proposal;
  }

  async createProposal(workspaceId: string, userId: string, input: CreateProposalInput) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);
    return this.proposalRepository.create(workspaceId, input);
  }

  async updateProposal(
    proposalId: string,
    workspaceId: string,
    userId: string,
    input: UpdateProposalInput
  ) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);
    return this.proposalRepository.update(proposalId, input);
  }

  async deleteProposal(proposalId: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);
    
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal || proposal.workspaceId !== workspaceId) {
      throw new Error('Proposal not found or does not belong to this workspace.');
    }

    return this.proposalRepository.softDelete(proposalId);
  }

  async sendProposal(proposalId: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal || proposal.workspaceId !== workspaceId) {
      throw new Error('Proposal not found or does not belong to this workspace.');
    }

    if (proposal.status !== ProposalStatus.DRAFT && proposal.status !== ProposalStatus.SENT) {
      throw new Error('Only draft or sent proposals can be transition to Sent.');
    }

    console.log(`Sending proposal ${proposal.proposalNumber} to client email ${proposal.client.primaryEmail}...`);

    return this.proposalRepository.updateStatus(proposalId, ProposalStatus.SENT);
  }

  async rejectProposal(proposalId: string, workspaceId: string, userId: string) {
    // Both OWNER and CLIENT roles can reject a proposal
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER, Role.CLIENT]);

    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal || proposal.workspaceId !== workspaceId) {
      throw new Error('Proposal not found or does not belong to this workspace.');
    }

    if (proposal.status !== ProposalStatus.SENT) {
      throw new Error('Only sent proposals can be rejected.');
    }

    return this.proposalRepository.updateStatus(proposalId, ProposalStatus.REJECTED);
  }

  async approveProposal(
    proposalId: string,
    workspaceId: string,
    userId: string
  ) {
    // 1. Validate Workspace access (both OWNER and CLIENT are allowed to approve)
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER, Role.CLIENT]);

    // Transaction wrapping the checks, status updates, project spawns, and usage limits
    return prisma.$transaction(async (tx) => {
      // 2. Validate Proposal exists and matches workspace context
      const proposal = await tx.proposal.findFirst({
        where: {
          id: proposalId,
          workspaceId,
          deletedAt: null,
        },
        include: {
          client: true,
          items: true,
        },
      });

      if (!proposal) {
        throw new Error('Proposal not found or does not belong to this workspace.');
      }

      // 3. Validate Proposal Status and Expiry
      if (proposal.status === ProposalStatus.APPROVED) {
        throw new Error('Proposal is already approved.');
      }

      if (new Date() > new Date(proposal.expiresAt)) {
        throw new Error('Proposal has expired and cannot be approved.');
      }

      // 4. Validate Subscription Active Project Limit
      const activeProjectsCount = await tx.project.count({
        where: {
          workspaceId,
          status: ProjectStatus.ACTIVE,
          deletedAt: null,
        },
      });

      const workspace = await tx.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new Error('Workspace not found.');
      }

      if (workspace.plan === 'FREE' && activeProjectsCount >= 3) {
        const error = new Error(
          'You have reached the maximum number of active projects allowed on the Free plan. Upgrade to Pro to approve this proposal.'
        );
        (error as any).code = 'LIMIT_EXCEEDED';
        throw error;
      }

      // 5. Approve Proposal (Update status to APPROVED)
      const approvedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.APPROVED },
        include: {
          items: true,
          client: true,
        },
      });

      // 6. Create Active Project (Auto-spawning)
      // Project budget is equal to the proposal totalAmount
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 30); // Default project timeline: 30 days from approval

      const project = await tx.project.create({
        data: {
          workspaceId,
          clientId: proposal.clientId,
          proposalId: proposal.id,
          name: proposal.title,
          description: proposal.description || `Project spawned from Proposal ${proposal.proposalNumber}`,
          budget: proposal.totalAmount,
          currency: proposal.currency,
          startDate: new Date(),
          deadline: defaultDeadline,
          status: ProjectStatus.ACTIVE,
          progress: 0,
        },
      });

      // 7. Update Workspace SubscriptionUsage projectsCount
      await tx.subscriptionUsage.update({
        where: { workspaceId },
        data: {
          activeProjectsCount: {
            increment: 1,
          },
        },
      });

      console.log(`Proposal ${proposal.proposalNumber} approved. Project "${project.name}" auto-spawned successfully.`);

      return {
        proposal: approvedProposal,
        project,
      };
    });
  }
}
