import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Output ────────────────────────────────────────────────────────────────
  // 'standalone' bundles only the files needed for production.
  output: 'standalone',

  // ── Turbopack root ────────────────────────────────────────────────────────
  // Explicitly set the workspace root to silence the multi-lockfile warning.
  turbopack: {
    root: __dirname,
  },

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Supabase Storage (user avatars, file previews)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Google profile pictures (OAuth users)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // GitHub profile pictures (OAuth users)
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // ── Security Headers ─────────────────────────────────────────────────────
  // Note: _next/static assets are served by Next.js with immutable headers
  // automatically — do NOT override Cache-Control for those routes.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // ── Logging ───────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // ── Compiler options ──────────────────────────────────────────────────────
  compiler: {
    // Strip console.log in production builds (keeps console.error/warn)
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
};

export default nextConfig;
