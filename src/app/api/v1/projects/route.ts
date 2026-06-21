import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ProjectService } from '@/features/projects/services/project-service';
import { createProjectSchema } from '@/features/projects/schemas/project';

const projectService = new ProjectService();

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

    const projects = await projectService.getProjects(workspaceId, session.user.id);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error('Get projects API error:', error);
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
    const parsed = createProjectSchema.safeParse(body);

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

    const project = await projectService.createProject(workspaceId, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error('Create project API error:', error);
    const isLimitExceeded = (error as any).code === 'LIMIT_EXCEEDED';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isLimitExceeded ? 'LIMIT_EXCEEDED' : 'API_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: isLimitExceeded ? 403 : 500 }
    );
  }
}
