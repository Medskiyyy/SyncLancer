'use server';

import { auth } from '@/auth';
import { ClientService } from '../services/client-service';
import { CreateClientInput, UpdateClientInput } from '../schemas/client';
import { revalidatePath } from 'next/cache';

const clientService = new ClientService();

export async function createClientAction(workspaceId: string, input: CreateClientInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = await clientService.createClient(workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/clients`);
    return { success: true, data: client };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create client' };
  }
}

export async function updateClientAction(clientId: string, workspaceId: string, input: UpdateClientInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = await clientService.updateClient(clientId, workspaceId, session.user.id, input);
    revalidatePath(`/[workspaceSlug]/clients`);
    revalidatePath(`/[workspaceSlug]/clients/${clientId}`);
    return { success: true, data: client };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update client' };
  }
}

export async function archiveClientAction(clientId: string, workspaceId: string, archived: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = await clientService.archiveClient(clientId, workspaceId, session.user.id, archived);
    revalidatePath(`/[workspaceSlug]/clients`);
    revalidatePath(`/[workspaceSlug]/clients/${clientId}`);
    return { success: true, data: client };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to archive client' };
  }
}

export async function deleteClientAction(clientId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await clientService.deleteClient(clientId, workspaceId, session.user.id);
    revalidatePath(`/[workspaceSlug]/clients`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete client' };
  }
}

export async function inviteClientPortalAction(
  workspaceId: string,
  clientId: string,
  email: string,
  title: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const clientUser = await clientService.inviteClientPortalUser(
      workspaceId,
      clientId,
      session.user.id,
      email,
      title,
    );
    revalidatePath(`/[workspaceSlug]/clients/${clientId}`);
    return { success: true, data: clientUser };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to invite client user' };
  }
}
