import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/features/auth/schemas/auth';
import prisma from '@/lib/prisma';
import * as argon2 from 'argon2';

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

    // In a real application:
    // 1. Verify token exists & not expired
    // 2. Fetch associated user
    // 3. Hash new password: const hash = await argon2.hash(parsed.data.password);
    // 4. Update user.passwordHash
    // 5. Delete token
    
    // For MVP validation mock, we'll hash the password and just return success
    const passwordHash = await argon2.hash(parsed.data.password);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful.',
    });
  } catch (error: any) {
    console.error('Reset password API error:', error);
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
