'use server';

import { auth } from '@/auth';
import { InvoiceService } from '../services/invoice-service';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice';
import { revalidatePath } from 'next/cache';

const invoiceService = new InvoiceService();

export async function createInvoiceAction(workspaceId: string, input: CreateInvoiceInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const invoice = await invoiceService.createInvoice(workspaceId, session.user.id, input);
    if (input.projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${input.projectId}`);
    }
    revalidatePath(`/[workspaceSlug]/invoices`);
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create invoice' };
  }
}

export async function updateInvoiceAction(id: string, workspaceId: string, projectId: string | null, input: UpdateInvoiceInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const invoice = await invoiceService.updateInvoice(id, workspaceId, session.user.id, input);
    if (projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    }
    revalidatePath(`/[workspaceSlug]/invoices`);
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update invoice' };
  }
}

export async function deleteInvoiceAction(id: string, workspaceId: string, projectId: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await invoiceService.deleteInvoice(id, workspaceId, session.user.id);
    if (projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    }
    revalidatePath(`/[workspaceSlug]/invoices`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete invoice' };
  }
}

export async function sendInvoiceAction(id: string, workspaceId: string, projectId: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const invoice = await invoiceService.sendInvoice(id, workspaceId, session.user.id);
    if (projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    }
    revalidatePath(`/[workspaceSlug]/invoices`);
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send invoice' };
  }
}

export async function markAsPaidAction(id: string, workspaceId: string, projectId: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const invoice = await invoiceService.markAsPaid(id, workspaceId, session.user.id);
    if (projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    }
    revalidatePath(`/[workspaceSlug]/invoices`);
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark invoice as paid' };
  }
}
