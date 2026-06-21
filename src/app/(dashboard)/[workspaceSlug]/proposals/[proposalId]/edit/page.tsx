import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { ClientService } from '@/features/clients/services/client-service';
import { ProposalService } from '@/features/proposals/services/proposal-service';
import { ProposalBuilder } from '@/features/proposals/components/proposal-builder';
import { ProposalStatus } from '@prisma/client';

const workspaceService = new WorkspaceService();
const clientService = new ClientService();
const proposalService = new ProposalService();

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    proposalId: string;
  }>;
}

export default async function EditProposalPage({ params }: PageProps) {
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

  // Only DRAFT status proposals can be edited
  if (proposal.status !== ProposalStatus.DRAFT) {
    redirect(`/${workspaceSlug}/proposals/${proposalId}`);
  }

  const clients = await clientService.getClients(workspace.id, session.user.id);

  return (
    <ProposalBuilder
      initialProposal={proposal as any}
      clients={clients}
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
    />
  );
}
