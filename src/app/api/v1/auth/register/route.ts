import { NextResponse } from 'next/server';
import { AuthService } from '@/features/auth/services/auth-service';
import { registerSchema } from '@/features/auth/schemas/auth';

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

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

    const user = await authService.register(parsed.data);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message || 'Registration failed',
        },
      },
      { status: 400 }
    );
  }
}
