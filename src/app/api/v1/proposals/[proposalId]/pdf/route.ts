import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ProposalService } from '@/features/proposals/services/proposal-service';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ProposalPdfDocument } from '@/features/proposals/components/proposal-pdf-document';

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

    // Render React-PDF document to buffer
    const pdfElement = React.createElement(ProposalPdfDocument, { proposal });
    const buffer = await renderToBuffer(pdfElement as any);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="proposal-${(proposal as any).proposalNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export proposal PDF error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
