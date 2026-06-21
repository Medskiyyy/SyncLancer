import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ProposalService } from '@/features/proposals/services/proposal-service';

const proposalService = new ProposalService();

export async function POST(
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

    const result = await proposalService.approveProposal(proposalId, workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Approve proposal API error:', error);
    const errorCode = error.code || 'API_ERROR';
    const status = error.code === 'LIMIT_EXCEEDED' ? 400 : 500;
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || 'An error occurred',
        },
      },
      { status }
    );
  }
}
