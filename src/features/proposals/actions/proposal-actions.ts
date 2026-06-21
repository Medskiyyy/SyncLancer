'use server';

import { auth } from '@/auth';
import { ProposalService } from '../services/proposal-service';
import { CreateProposalInput, UpdateProposalInput } from '../schemas/proposal';
import { revalidatePath } from 'next/cache';

const proposalService = new ProposalService();

export async function createProposalAction(workspaceId: string, input: CreateProposalInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const proposal = await proposalService.createProposal(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/proposals`);
    revalidatePath(`/[workspaceSlug]/clients/${input.clientId}`);
    return { success: true, data: proposal };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create proposal' };
  }
}

export async function updateProposalAction(
  proposalId: string,
  workspaceId: string,
  input: UpdateProposalInput
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const proposal = await proposalService.updateProposal(proposalId, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/proposals`);
    revalidatePath(`/[workspaceSlug]/proposals/${proposalId}`);
    return { success: true, data: proposal };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update proposal' };
  }
}

export async function deleteProposalAction(proposalId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const proposal = await proposalService.deleteProposal(proposalId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/proposals`);
    revalidatePath(`/[workspaceSlug]/clients/${proposal.clientId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete proposal' };
  }
}

export async function sendProposalAction(proposalId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const proposal = await proposalService.sendProposal(proposalId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/proposals`);
    revalidatePath(`/[workspaceSlug]/proposals/${proposalId}`);
    return { success: true, data: proposal };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send proposal' };
  }
}

export async function rejectProposalAction(proposalId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const proposal = await proposalService.rejectProposal(proposalId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/proposals`);
    revalidatePath(`/[workspaceSlug]/proposals/${proposalId}`);
    return { success: true, data: proposal };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reject proposal' };
  }
}

export async function approveProposalAction(proposalId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await proposalService.approveProposal(proposalId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/proposals`);
    revalidatePath(`/[workspaceSlug]/proposals/${proposalId}`);
    revalidatePath(`/[workspaceSlug]/projects`);
    revalidatePath(`/[workspaceSlug]/clients/${result.proposal.clientId}`);
    return { success: true, data: result };
  } catch (error: any) {
    // If the error code is LIMIT_EXCEEDED, pass it to UI
    const errorCode = (error as any).code || 'APPROVE_ERROR';
    return { 
      success: false, 
      error: error.message || 'Failed to approve proposal',
      code: errorCode
    };
  }
}
