import { getErrorMessage } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { FileService } from '@/features/files/services/file-service';

const fileService = new FileService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return new Response('Workspace ID is required', { status: 400 });
    }

    const signedUrl = await fileService.getFileDownloadUrl(fileId, workspaceId, session.user.id);

    return NextResponse.redirect(signedUrl);
  } catch (error: unknown) {
    console.error('File download API error:', error);
    return new Response(getErrorMessage(error, 'An error occurred during file download'), { status: 550 });
  }
}
