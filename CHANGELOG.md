# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Phase 1: Project Foundation**:
  - Initialized Next.js 16.2.9 app with React 19, TypeScript, and Tailwind CSS v4 in `src/` directory.
  - Initialized Git repository and connected remote `https://github.com/Medskiyyy/SyncLancer.git`.
  - Installed and initialized `shadcn/ui` with custom SaaS Blue theme variables using OKLCH values in `src/app/globals.css`.
  - Installed main app dependencies: `@prisma/client`, `next-themes`, `lucide-react`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@tanstack/react-table`, `recharts`, `@dnd-kit/core`, `@dnd-kit/sortable`, `date-fns`, `sonner`, `@react-pdf/renderer`, `@supabase/supabase-js`.
  - Installed dev dependencies: `prisma`, `prettier`, `prettier-plugin-tailwindcss`, `vitest`, `@playwright/test`.
  - Configured full database schema with 18 entities (users, workspaces, members, leads, clients, proposals, projects, milestones, tasks, invoices, time entries, files, notifications, etc.) in `prisma/schema.prisma`.
  - Generated Prisma Client v5.22.0.
  - Created Prisma Client singleton `src/lib/prisma.ts` and Supabase Client `src/lib/supabase.ts`.
  - Added Prettier configuration in `.prettierrc` and placeholder environment variables in `.env.example`.
  - Created initial documentation files: `README.md`, `CHANGELOG.md`, and `PROJECT_STATE.md`.
  - Verified local compilation is healthy via production build test.
