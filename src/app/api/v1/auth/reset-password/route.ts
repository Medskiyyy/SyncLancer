import { getErrorMessage } from '@/lib/errors';
import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/features/auth/schemas/auth';
import { AuthService } from '@/features/auth/services/auth-service';

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

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

    try {
      await authService.resetPassword(parsed.data.token, parsed.data.password);
    } catch (resetError: unknown) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: getErrorMessage(resetError, 'This reset link is invalid or has expired.'),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful.',
    });
  } catch (error: unknown) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: getErrorMessage(error, 'An error occurred'),
        },
      },
      { status: 500 }
    );
  }
}
