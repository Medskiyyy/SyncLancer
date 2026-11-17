import { auth } from '@/auth';
import { serialize } from '@/lib/serialize';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ProposalService } from '@/features/proposals/services/proposal-service';
import { ProposalList } from '@/features/proposals/components/proposal-list';

const workspaceService = new WorkspaceService();
const proposalService = new ProposalService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ProposalsPage({ params }: PageProps) {
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
  } catch {
    redirect('/');
  }

  const proposals = await proposalService.getProposals(workspace.id, session.user.id);

  return (
    <ProposalList
      initialProposals={serialize(proposals)}
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
    />
  );
}
