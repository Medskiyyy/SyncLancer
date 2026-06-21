import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ClientService } from '@/features/clients/services/client-service';
import { ClientProfile } from '@/features/clients/components/client-profile';

const workspaceService = new WorkspaceService();
const clientService = new ClientService();

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    clientId: string;
  }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug, clientId } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  try {
    // Validate workspace membership
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);
  } catch (error) {
    redirect('/');
  }

  const client = await clientService.getClientById(clientId, workspace.id, session.user.id);
  if (!client) {
    notFound();
  }

  const files = await clientService.getClientFiles(workspace.id, clientId, session.user.id);

  // Cast client to the expected ExtendedClient structure
  return (
    <ClientProfile
      client={client as any}
      files={files}
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
    />
  );
}
