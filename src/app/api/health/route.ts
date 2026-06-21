import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/health
 *
 * Returns a simple health check response. Used by Playwright E2E tests
 * and any uptime monitors.
 */
export async function GET() {
  try {
    // Verify DB connectivity with a minimal query
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch {
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 503 });
  }
}
