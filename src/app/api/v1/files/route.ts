import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { FileService } from '@/features/files/services/file-service';
import { FileRepository } from '@/features/files/repositories/file-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';

const fileService = new FileService();
const fileRepository = new FileRepository();
const workspaceService = new WorkspaceService();

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

    let files;
    if (projectId) {
      files = await fileService.getFilesByProjectId(projectId, workspaceId, session.user.id);
    } else {
      await workspaceService.validateWorkspaceAccess(workspaceId, session.user.id);
      files = await fileRepository.listByWorkspaceId(workspaceId);
    }

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error('Get files API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
