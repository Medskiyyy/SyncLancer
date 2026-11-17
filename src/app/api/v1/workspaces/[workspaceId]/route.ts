import { getErrorMessage } from '@/lib/errors';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { updateWorkspaceSchema } from '@/features/workspace/schemas/workspace';

const workspaceService = new WorkspaceService();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { workspaceId } = await params;
    const body = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(body);

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

    const workspace = await workspaceService.updateWorkspace(
      workspaceId,
      session.user.id,
      parsed.data
    );

    return NextResponse.json({
      success: true,
      data: workspace,
    });
  } catch (error: unknown) {
    console.error('Update workspace API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: getErrorMessage(error, 'An error occurred') } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { workspaceId } = await params;
    await workspaceService.deleteWorkspace(workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete workspace API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: getErrorMessage(error, 'An error occurred') } },
      { status: 500 }
    );
  }
}
