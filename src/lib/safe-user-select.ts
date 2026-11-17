import { Prisma } from '@prisma/client';

/**
 * The only User fields safe to send to a Client Component.
 *
 * `user: true` / `uploader: true` pulls the whole row — including `passwordHash`
 * — and repository results are handed to Client Components as props, which puts
 * the argon2 hash straight into the browser's RSC payload. Always select.
 */
export const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  emailVerified: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
