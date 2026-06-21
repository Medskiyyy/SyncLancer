import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { FileService } from '@/features/files/services/file-service';

const fileService = new FileService();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = request.headers.get('X-Workspace-Id') || formData.get('workspaceId') as string;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'File is required' } },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await fileService.uploadFile(
      workspaceId,
      session.user.id,
      projectId || null,
      buffer,
      file.name,
      file.type,
      file.size
    );

    return NextResponse.json({
      success: true,
      data: uploaded,
    });
  } catch (error: any) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
