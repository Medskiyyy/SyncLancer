import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ProposalService } from '@/features/proposals/services/proposal-service';
import { updateProposalSchema } from '@/features/proposals/schemas/proposal';

const proposalService = new ProposalService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { proposalId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const proposal = await proposalService.getProposalById(proposalId, workspaceId, session.user.id);
    if (!proposal) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Proposal not found or does not belong to this workspace' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Get proposal detail API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { proposalId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid input',
          },
        },
        { status: 400 }
      );
    }

    const proposal = await proposalService.updateProposal(proposalId, workspaceId, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Update proposal API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { proposalId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    await proposalService.deleteProposal(proposalId, workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Proposal soft-deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete proposal API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
