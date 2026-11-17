import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks must be declared before any imports that transitively load the module ──
vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: vi.fn(),
    passwordResetToken: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/features/auth/repositories/user-repository', () => {
  const mock = vi.fn();
  mock.prototype.findByEmail = vi.fn();
  mock.prototype.create = vi.fn();
  mock.prototype.updateProfile = vi.fn();
  return { UserRepository: mock };
});

vi.mock('argon2', () => ({
  hash: vi.fn(async (value: string) => `hashed:${value}`),
  verify: vi.fn(async (hash: string, plain: string) => hash === `hashed:${plain}`),
}));

import { AuthService } from '../auth-service';
import prisma from '@/lib/prisma';
import { UserRepository } from '@/features/auth/repositories/user-repository';

const USER = {
  id: 'user-1',
  email: 'freelancer@example.com',
  fullName: 'Test User',
  passwordHash: 'hashed:OldPassword1!',
};

describe('AuthService password reset', () => {
  let service: AuthService;
  const repo = () => UserRepository.prototype as unknown as {
    findByEmail: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
    // default: transactions just run their callback / resolve their array
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (arg: unknown) => (typeof arg === 'function' ? arg(prisma) : arg)
    );
  });

  // ───────────────────────────────────────────────
  // createPasswordResetToken
  // ───────────────────────────────────────────────
  describe('createPasswordResetToken', () => {
    it('returns null for an unknown email so accounts cannot be enumerated', async () => {
      repo().findByEmail.mockResolvedValue(null);

      const result = await service.createPasswordResetToken('nobody@example.com');

      expect(result).toBeNull();
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('stores only a hash of the token, never the token itself', async () => {
      repo().findByEmail.mockResolvedValue(USER);

      const result = await service.createPasswordResetToken(USER.email);

      expect(result).not.toBeNull();
      const created = (prisma.passwordResetToken.create as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(created.data.tokenHash).toBeTruthy();
      expect(created.data.tokenHash).not.toBe(result!.token);
      expect(created.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('invalidates outstanding tokens before issuing a new one', async () => {
      repo().findByEmail.mockResolvedValue(USER);

      await service.createPasswordResetToken(USER.email);

      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER.id, usedAt: null } })
      );
    });

    it('sets an expiry in the future', async () => {
      repo().findByEmail.mockResolvedValue(USER);

      await service.createPasswordResetToken(USER.email);

      const created = (prisma.passwordResetToken.create as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(created.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('issues a different token on every request', async () => {
      repo().findByEmail.mockResolvedValue(USER);

      const first = await service.createPasswordResetToken(USER.email);
      const second = await service.createPasswordResetToken(USER.email);

      expect(first!.token).not.toBe(second!.token);
    });
  });

  // ───────────────────────────────────────────────
  // resetPassword
  // ───────────────────────────────────────────────
  describe('resetPassword', () => {
    const futureDate = () => new Date(Date.now() + 60_000);
    const pastDate = () => new Date(Date.now() - 60_000);

    it('rejects an unknown token', async () => {
      (prisma.passwordResetToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(service.resetPassword('bogus', 'NewPassword1!')).rejects.toThrow(
        'invalid or has expired'
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an expired token', async () => {
      (prisma.passwordResetToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 't1',
        userId: USER.id,
        usedAt: null,
        expiresAt: pastDate(),
      });

      await expect(service.resetPassword('tok', 'NewPassword1!')).rejects.toThrow(
        'invalid or has expired'
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects a token that was already used', async () => {
      (prisma.passwordResetToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 't1',
        userId: USER.id,
        usedAt: new Date(),
        expiresAt: futureDate(),
      });

      await expect(service.resetPassword('tok', 'NewPassword1!')).rejects.toThrow(
        'invalid or has expired'
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('writes the new hash and burns the token for a valid request', async () => {
      (prisma.passwordResetToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 't1',
        userId: USER.id,
        usedAt: null,
        expiresAt: futureDate(),
      });

      await service.resetPassword('tok', 'NewPassword1!');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: USER.id },
        data: { passwordHash: 'hashed:NewPassword1!' },
      });
      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        })
      );
    });

    it('never stores the raw password', async () => {
      (prisma.passwordResetToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 't1',
        userId: USER.id,
        usedAt: null,
        expiresAt: futureDate(),
      });

      await service.resetPassword('tok', 'NewPassword1!');

      const call = (prisma.user.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.data.passwordHash).not.toBe('NewPassword1!');
    });
  });
});
