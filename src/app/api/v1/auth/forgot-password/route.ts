import { NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/features/auth/schemas/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

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

    // In a real application:
    // 1. Find user by email
    // 2. Generate secure token & expiry
    // 3. Save to user/token DB
    // 4. Send email via Resend with link: http://domain/reset-password?token=XYZ

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: 500 }
    );
  }
}
