import { getErrorMessage } from '@/lib/errors';
import { NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/features/auth/schemas/auth';
import { AuthService } from '@/features/auth/services/auth-service';
import { sendEmail } from '@/lib/email';

const authService = new AuthService();

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

    const issued = await authService.createPasswordResetToken(parsed.data.email);

    // The response below is deliberately identical whether or not the account
    // exists, so this endpoint cannot be used to discover registered emails.
    if (issued) {
      const appUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${issued.token}`;

      try {
        await sendEmail({
          to: issued.user.email,
          subject: 'Reset your SyncLancer password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-top: 0;">Reset your password</h2>
              <p>Hi ${issued.user.fullName},</p>
              <p>We received a request to reset the password for your SyncLancer account. This link is valid for one hour and can be used once.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                If you did not request this you can ignore this email &mdash; your password stays unchanged.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // The token is stored already; surfacing a delivery failure here would
        // also reveal that the account exists.
        console.error('Failed to send password reset email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    });
  } catch (error: unknown) {
    console.error('Forgot password API error:', error);
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
