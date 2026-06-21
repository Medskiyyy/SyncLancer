import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

// Next.js 16 proxy requires a default or "proxy" function export
export default auth;

export const config = {
  // Protect all routes except static assets, favicon, etc.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
