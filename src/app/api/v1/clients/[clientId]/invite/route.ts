import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ClientService } from '@/features/clients/services/client-service';
import { z } from 'zod';

const clientService = new ClientService();

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  title: z.string().min(1, 'Title is required'),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = request.headers.get('X-Workspace-Id') || searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Workspace ID is required' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);

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

    const clientUser = await clientService.inviteClientPortalUser(
      workspaceId,
      clientId,
      session.user.id,
      parsed.data.email,
      parsed.data.title
    );

    return NextResponse.json({
      success: true,
      data: clientUser,
    });
  } catch (error: any) {
    console.error('Invite client portal user API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'API_ERROR', message: error.message || 'An error occurred' } },
      { status: 500 }
    );
  }
}
