import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TimeEntryService } from '@/features/time-tracking/services/time-entry-service';
import { createTimeEntrySchema } from '@/features/time-tracking/schemas/time-entry';

const timeEntryService = new TimeEntryService();

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
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID header or query parameter is required' } },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Project ID query parameter is required' } },
        { status: 400 }
      );
    }

    const entries = await timeEntryService.getTimeEntriesByProjectId(projectId, workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error: any) {
    console.error('Get time entries API error:', error);
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
    const parsed = createTimeEntrySchema.safeParse(body);

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

    const entry = await timeEntryService.createTimeEntry(workspaceId, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    console.error('Create time entry API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
