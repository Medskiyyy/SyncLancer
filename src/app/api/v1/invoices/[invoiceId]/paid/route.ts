import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { InvoiceService } from '@/features/invoices/services/invoice-service';

const invoiceService = new InvoiceService();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { invoiceId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const result = await invoiceService.markAsPaid(invoiceId, workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Mark invoice as paid API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
