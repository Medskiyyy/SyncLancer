'use server';

import { auth } from '@/auth';
import { LeadService } from '../services/lead-service';
import { CreateLeadInput, UpdateLeadInput } from '../schemas/lead';
import { LeadStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const leadService = new LeadService();

export async function createLeadAction(workspaceId: string, input: CreateLeadInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const lead = await leadService.createLead(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/crm`);
    return { success: true, data: lead };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create lead' };
  }
}

export async function updateLeadAction(leadId: string, workspaceId: string, input: UpdateLeadInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const lead = await leadService.updateLead(leadId, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/crm`);
    return { success: true, data: lead };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update lead' };
  }
}

export async function updateLeadStatusAction(leadId: string, workspaceId: string, status: LeadStatus) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const lead = await leadService.updateLeadStatus(leadId, workspaceId, session.user.id, status);
    revalidatePath(`/[workspaceSlug]/crm`);
    return { success: true, data: lead };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update lead status' };
  }
}

export async function deleteLeadAction(leadId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await leadService.deleteLead(leadId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/crm`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete lead' };
  }
}

export async function convertLeadToClientAction(leadId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = await leadService.convertLeadToClient(leadId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/crm`);
    return { success: true, data: client };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to convert lead to client' };
  }
}
