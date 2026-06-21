import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { TimeEntryService } from '@/features/time-tracking/services/time-entry-service';
import { updateTimeEntrySchema } from '@/features/time-tracking/schemas/time-entry';

const timeEntryService = new TimeEntryService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { entryId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');
    const projectId = searchParams.get('projectId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Project ID is required' } },
        { status: 400 }
      );
    }

    const entries = await timeEntryService.getTimeEntriesByProjectId(projectId, workspaceId, session.user.id);
    const entry = entries.find((e: any) => e.id === entryId);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found or does not belong to this workspace' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    console.error('Get time entry detail API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { entryId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateTimeEntrySchema.safeParse(body);

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

    const entry = await timeEntryService.updateTimeEntry(entryId, workspaceId, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    console.error('Update time entry API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { entryId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    await timeEntryService.deleteTimeEntry(entryId, workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Time entry deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete time entry API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
