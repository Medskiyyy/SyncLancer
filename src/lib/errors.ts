/**
 * Error helpers so `catch` blocks can use `unknown` (what TypeScript actually
 * gives you) instead of `any`, without losing the message or the error code
 * that services attach for plan-limit handling.
 */

/** Error carrying a machine-readable code the UI branches on (e.g. LIMIT_EXCEEDED). */
export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

/** Extracts a human-readable message from an unknown thrown value. */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error) {
    return error;
  }
  return fallback;
}

/** Reads the `code` off an error when present, else the given fallback. */
export function getErrorCode(error: unknown, fallback = 'UNKNOWN_ERROR'): string {
  if (error instanceof AppError) {
    return error.code;
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const { code } = error as { code?: unknown };
    if (typeof code === 'string' && code) {
      return code;
    }
  }
  return fallback;
}
