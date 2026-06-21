'use server';

import { signIn, signOut } from '@/auth';
import { AuthService } from '../services/auth-service';
import { RegisterInput, LoginInput } from '../schemas/auth';
import { AuthError } from 'next-auth';

const authService = new AuthService();

export async function registerAction(input: RegisterInput) {
  try {
    const user = await authService.register(input);
    return { success: true, data: { userId: user.id } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Registration failed' };
  }
}

export async function loginAction(input: LoginInput) {
  try {
    await signIn('credentials', {
      email: input.email,
      password: input.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' };
        default:
          return { success: false, error: 'Something went wrong during sign-in' };
      }
    }
    // Re-throw if it's redirect redirection or other specific next errors
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
