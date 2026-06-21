import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ProposalService } from '@/features/proposals/services/proposal-service';
import { ProposalDetail } from '@/features/proposals/components/proposal-detail';

const workspaceService = new WorkspaceService();
const proposalService = new ProposalService();

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    proposalId: string;
  }>;
}

export default async function ProposalDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug, proposalId } = await params;
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

  const proposal = await proposalService.getProposalById(proposalId, workspace.id, session.user.id);
  if (!proposal) {
    notFound();
  }

  return (
    <ProposalDetail
      proposal={proposal as any}
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
    />
  );
}
