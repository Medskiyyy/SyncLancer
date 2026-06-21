import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { LeadService } from '@/features/crm/services/lead-service';
import { createLeadSchema } from '@/features/crm/schemas/lead';

const leadService = new LeadService();

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

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID header or query parameter is required' } },
        { status: 400 }
      );
    }

    const leads = await leadService.getLeads(workspaceId, session.user.id);
    
    // Simple filter by status if provided in query params
    const statusFilter = searchParams.get('status');
    const filteredLeads = statusFilter 
      ? leads.filter(lead => lead.status === statusFilter)
      : leads;

    return NextResponse.json({
      success: true,
      data: filteredLeads,
    });
  } catch (error: any) {
    console.error('Get leads API error:', error);
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
    const parsed = createLeadSchema.safeParse(body);

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

    const lead = await leadService.createLead(workspaceId, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error('Create lead API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
