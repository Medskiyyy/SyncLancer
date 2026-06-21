import { ProposalRepository } from '../repositories/proposal-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { NotificationService } from '@/features/notifications/services/notification-service';
import { sendEmail } from '@/lib/email';
import { CreateProposalInput, UpdateProposalInput } from '../schemas/proposal';
import { Proposal, ProposalStatus, Project, ProjectStatus, Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ProposalService {
  private proposalRepository: ProposalRepository;
  private workspaceService: WorkspaceService;
  private notificationService: NotificationService;

  constructor() {
    this.proposalRepository = new ProposalRepository();
    this.workspaceService = new WorkspaceService();
    this.notificationService = new NotificationService();
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

    // 1. Create in-app notifications for all client portal users of this client
    const clientUsers = await prisma.clientUser.findMany({
      where: { clientId: proposal.clientId },
    });
    for (const clientUser of clientUsers) {
      await this.notificationService.createNotification(
        clientUser.userId,
        'New Proposal Received',
        `You have received a new proposal "${proposal.title}" for review.`
      );
    }

    // 2. Send invitation/proposal email via Resend
    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    const workspaceSlug = workspace?.slug || workspaceId;
    const workspaceName = workspace?.name || 'SyncLancer';
    const proposalUrl = `${appUrl}/${workspaceSlug}/proposals/${proposalId}`;

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal.currency,
    }).format(Number(proposal.totalAmount));

    try {
      await sendEmail({
        to: proposal.client.primaryEmail,
        subject: `New Proposal: "${proposal.title}" from ${workspaceName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-top: 0; font-family: Outfit, Inter, sans-serif;">New Proposal Received</h2>
            <p>Dear ${proposal.client.companyName},</p>
            <p><strong>${workspaceName}</strong> has sent you a new proposal for review.</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e4e4e7;">
                <td style="padding: 8px 0; color: #71717a;">Proposal Number:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${proposal.proposalNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e4e4e7;">
                <td style="padding: 8px 0; color: #71717a;">Title:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${proposal.title}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e4e4e7;">
                <td style="padding: 8px 0; color: #71717a;">Total Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #4f46e5; font-size: 16px;">${formattedAmount}</td>
              </tr>
            </table>

            <div style="margin: 30px 0; text-align: center;">
              <a href="${proposalUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Review & Approve Proposal</a>
            </div>
            <p style="color: #71717a; font-size: 12px; margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
              This is an automated notification sent on behalf of ${workspaceName}. If you have any questions, please contact them directly.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send proposal email:', emailError);
    }

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

    const updated = await this.proposalRepository.updateStatus(proposalId, ProposalStatus.REJECTED);

    // Fetch workspace to get ownerId
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (workspace) {
      await this.notificationService.createNotification(
        workspace.ownerId,
        'Proposal Rejected',
        `Proposal "${proposal.title}" has been rejected by ${proposal.client.companyName}.`
      );
    }

    return updated;
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

      // 8. Create in-app notification for the workspace owner
      await tx.notification.create({
        data: {
          userId: workspace.ownerId,
          title: 'Proposal Approved',
          message: `Proposal "${proposal.title}" has been approved by ${proposal.client.companyName}.`,
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
