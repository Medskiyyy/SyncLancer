'use server';

import { auth } from '@/auth';
import { RecurringInvoiceService } from '../services/recurring-invoice-service';
import { CreateRecurringInvoiceInput } from '../schemas/recurring-invoice';
import { revalidatePath } from 'next/cache';

const recurringInvoiceService = new RecurringInvoiceService();

export async function getRecurringInvoiceAction(workspaceId: string, clientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const config = await recurringInvoiceService.getRecurringInvoice(workspaceId, clientId, session.user.id);
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch recurring configuration' };
  }
}

export async function saveRecurringInvoiceAction(
  workspaceId: string,
  clientId: string,
  input: CreateRecurringInvoiceInput,
  projectId?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const config = await recurringInvoiceService.saveRecurringInvoice(
      workspaceId,
      clientId,
      session.user.id,
      input
    );

    if (projectId) {
      revalidatePath(`/[workspaceSlug]/projects/${projectId}`);
    }

    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save recurring configuration' };
  }
}
