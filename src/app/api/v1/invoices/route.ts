import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { InvoiceService } from '@/features/invoices/services/invoice-service';
import { createInvoiceSchema } from '@/features/invoices/schemas/invoice';

const invoiceService = new InvoiceService();

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');
    const projectId = searchParams.get('projectId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    let invoices;
    if (projectId) {
      invoices = await invoiceService.getInvoicesByProjectId(projectId, workspaceId, session.user.id);
    } else {
      invoices = await invoiceService.getInvoices(workspaceId, session.user.id);
    }

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    console.error('Get invoices API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

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

    const invoice = await invoiceService.createInvoice(workspaceId, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    console.error('Create invoice API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
