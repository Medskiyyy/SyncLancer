import * as argon2 from 'argon2';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user-repository';
import { RegisterInput, LoginInput } from '../schemas/auth';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';

/** How long an emailed reset link stays valid. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Tokens are stored hashed so a database leak cannot be replayed. */
function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(input: RegisterInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      if (existingUser.passwordHash) {
        throw new Error('User with this email already exists');
      }
      
      const passwordHash = await argon2.hash(input.password);
      return this.userRepository.updateProfile(existingUser.id, {
        fullName: input.name,
        passwordHash,
        emailVerified: true,
      });
    }

    const passwordHash = await argon2.hash(input.password);

    return this.userRepository.create({
      email: input.email,
      fullName: input.name,
      passwordHash,
    });
  }

  async validateCredentials(input: LoginInput): Promise<User | null> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Issues a single-use reset token for an email address.
   *
   * Returns null when no account matches so the caller can answer identically
   * either way — a different response would let anyone enumerate registered
   * emails. Any outstanding tokens for the user are invalidated first, so a
   * newly requested link always supersedes older ones.
   */
  async createPasswordResetToken(
    email: string
  ): Promise<{ user: User; token: string } | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashResetToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });
    });

    return { user, token };
  }

  /**
   * Consumes a reset token and sets the new password.
   *
   * Throws when the token is unknown, already used, or expired. The token is
   * marked used in the same transaction as the password write, so a link can
   * never be replayed.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
      throw new Error('This reset link is invalid or has expired. Please request a new one.');
    }

    const passwordHash = await argon2.hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }
}
