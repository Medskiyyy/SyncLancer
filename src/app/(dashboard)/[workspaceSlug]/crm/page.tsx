import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { LeadService } from '@/features/crm/services/lead-service';
import { LeadKanbanBoard } from '@/features/crm/components/lead-kanban-board';

const workspaceService = new WorkspaceService();
const leadService = new LeadService();

export default async function CrmPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
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

  const leads = await leadService.getLeads(workspace.id, session.user.id);

  return <LeadKanbanBoard initialLeads={leads} workspaceId={workspace.id} />;
}
