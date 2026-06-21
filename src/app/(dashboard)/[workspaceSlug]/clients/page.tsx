import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ClientService } from '@/features/clients/services/client-service';
import { ClientList } from '@/features/clients/components/client-list';

const workspaceService = new WorkspaceService();
const clientService = new ClientService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ClientsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
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

  const clients = await clientService.getClients(workspace.id, session.user.id);

  return (
    <ClientList
      initialClients={clients}
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
    />
  );
}
