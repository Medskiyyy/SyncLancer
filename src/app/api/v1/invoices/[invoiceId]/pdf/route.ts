import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { InvoiceService } from '@/features/invoices/services/invoice-service';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { InvoicePdfDocument } from '@/features/invoices/components/invoice-pdf-document';

const invoiceService = new InvoiceService();

export async function GET(
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

    const invoice = await invoiceService.getInvoiceById(invoiceId, workspaceId, session.user.id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found or does not belong to this workspace' } },
        { status: 404 }
      );
    }

    // Render React-PDF document to buffer
    const pdfElement = React.createElement(InvoicePdfDocument, { invoice });
    const buffer = await renderToBuffer(pdfElement as any);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${(invoice as any).invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export invoice PDF error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
