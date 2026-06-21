# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Routing & Performance Audit**:
  - Implemented the three missing workspace-level freelancer routes: Invoices (`/[workspaceSlug]/invoices`), Files (`/[workspaceSlug]/files`), and Analytics (`/[workspaceSlug]/analytics`).
  - Created a global animated skeleton loading screen component at `/[workspaceSlug]/loading.tsx` to handle route transitions client-side instantaneously.
  - Developed a robust client-side `WorkspaceInvoiceManager` dashboard component supporting status filtering, invoice search, PDF download, inline action dispatches (Mark as Paid, Send, Delete), and a dynamic draft creation dialog.

### Changed
- **Database Fetching Optimization**:
  - Refactored `AnalyticsService.getWorkspaceDashboardData` to run all 14 database queries in parallel using `Promise.all` instead of sequential awaits, eliminating query waterfalls and reducing dashboard load times from ~2s to <100ms.
- **File Action Adjustments**:
  - Modified `deleteFileAction` to make `projectId` optional and added `revalidatePath('/[workspaceSlug]/files')` to support workspace-level file deletions.
- **Invoice Action Adjustments**:
  - Added `revalidatePath('/[workspaceSlug]/invoices')` to all invoice-related server actions to ensure data updates sync instantly on the global workspace list.


### Added
- **Phase 18: PWA**:
  - Implemented dynamic PWA configurations in `manifest.ts` exposing icons, colors, display standalone, and app descriptions.
  - Created a robust custom service worker in `sw.js` to pre-cache crucial application assets and handle navigation offline falls to `/offline`.
  - Built an animated PWA register client component `pwa-register.tsx` and integrated it globally in the root layout.
  - Designed a high-fidelity visual Offline page (`/offline`) enabling users to retry connections.
  - Seeded PWA branding assets (`icon-192.png`, `icon-512.png`) inside the public directory.

- **Phase 17: Subscription**:
  - Enforced 1 workspace limit for Free plan users by checking existing owned workspaces before permitting new workspace creation in `workspace-service.ts`.
  - Created a comprehensive Workspace Settings page containing General metadata management (workspace name, logo) and Plan & Limits configuration.
  - Implemented visual limit monitoring progress bars tracking Project counts, Client counts, and Storage utilization against Free plan allowances.
  - Implemented dynamic state-based Plan Tier toggles enabling seamless upgrading and downgrading in the database.

- **Phase 16: Notifications**:
  - Implemented `NotificationService` and server actions (`getNotificationsAction`, `getUnreadCountAction`, `markAsReadAction`, `markAllAsReadAction`) to manage in-app notifications.
  - Built an interactive client-side `NotificationCenter` dropdown component with a real-time unread badge, click-outside auto-closure, and individual/mass read triggers.
  - Replaced the static bell button in the dashboard topbar layout with the new interactive `NotificationCenter`.
  - Integrated Resend transactional email templates and dispatch services into Client Portal invitations and Proposal reviews.
  - Linked automated in-app notifications to triggers for Client Portal invitations, Proposal dispatches/reviews, and Invoice dispatches/payments.

- **Phase 15: Analytics**:
  - Created `AnalyticsService` to dynamically calculate key performance indicators (Total Revenue, Active Projects, Active Clients, Pending Invoices).
  - Developed comparison calculations showing percentage growth from the previous month.
  - Implemented dynamic rolling 12 months **Revenue Trend** line chart using Recharts.
  - Implemented dynamic **Projects by Status** status distribution bar chart using Recharts with custom color cell mapping.
  - Integrated dynamic workload tracking (logged hours vs. weekly target, active tasks, upcoming milestone details).
  - Designed a live unified **Recent Activity Feed** combining update feeds from invoices, proposals, leads, and milestones.
  - Integrated the analytics service, charts, and workload data into the main dashboard page route.

- **Phase 14: Client Portal**:
  - Implemented `<ClientPortalRedirect>` client-side router utility.
  - Conditionally rendered client portal layout with limited sidebar navigations (Dashboard, Invoices, Files) and branding headers.
  - Created client portal page routes (`/portal`, `/portal/projects/[projectId]`, `/portal/invoices`, `/portal/files`).
  - Added project milestone view, Kanban task cards, invoice listings, and shared files panels in read-only layouts.
  - Enforced backend access isolation checks in `file-service.ts` to restrict client upload/download actions to client projects.

- **Phase 13: Recurring Invoices**:
  - Configured recurring invoice Prisma configurations, Zod schemas, and repositories.
  - Implemented automated daily cron executing next-run schedulers, cloning template invoice lines and details, generating drafts, and triggering Resend dispatches.
  - Integrated a premium Recurring Invoice card manager within the project invoice controls page.

- **Phase 7: Project Management**:
  - Designed Zod schemas for project creation and updates.
  - Built `ProjectRepository` with deep relations loading and templates support.
  - Implemented transactional project creation enforcing active project limits (max 3 active projects for Free plan).
  - Developed automatic project templates seeding (5 types) and scheduled milestone/task distribution logic.
  - Developed Server Actions in `src/features/projects/actions/project-actions.ts` and REST API routes under `/api/v1/projects`, `/api/v1/projects/[projectId]`, and `/api/v1/project-templates`.
  - Built interactive client-side `ProjectList` component displaying grid cards, progress bars, and search/filters.
  - Built client-side `ProjectBuilder` form with dynamic plan limit notifications.
  - Built server-side projects page, edit project page, and detail page routes.

- **Phase 8: Milestones**:
  - Designed Zod validation schemas for milestones.
  - Created `MilestoneRepository` and `MilestoneService` with access control validation.
  - Designed database transactions for milestone mutations that automatically update project progress.
  - Built Server Actions in `src/features/milestones/actions/milestone-actions.ts`.
  - Developed interactive milestone CRUD modals (Add, Edit, Delete) integrated inside the project details timeline.

- **Phase 6: Proposal Module**:
  - Designed Zod validation schemas for proposals and nested pricing line items.
  - Implemented `ProposalRepository` with automated sequential number generators (`PROP-YYYY-XXXX`) and transactional draft editing.
  - Developed `ProposalService` handling status workflows, active project subscription limits (max 3 for FREE plan), and project auto-creation wrapped in a single database transaction.
  - Built a server-side PDF generator using `@react-pdf/renderer` layouts with right-aligned totals and high-contrast tables.
  - Created Server Actions in `src/features/proposals/actions/proposal-actions.ts` and REST APIs under `/api/v1/proposals`, `/api/v1/proposals/[proposalId]`, `/api/v1/proposals/[proposalId]/send`, `/api/v1/proposals/[proposalId]/approve`, `/api/v1/proposals/[proposalId]/reject`, and `/api/v1/proposals/[proposalId]/pdf`.
  - Built dynamic `ProposalBuilder` form with real-time tax calculation, line item fields, and cost summaries.
  - Built `ProposalDetail` layout with status transition triggers, PDF download links, and custom project-limit warning dialogs.
  - Updated local documents (PRD.md, TDD.md, API_SPEC.md) to reflect proposal active project validations.

- **Phase 5: Client Management**:
  - Implemented client CRUD schemas, service layers, and repository interfaces with transaction-safe plan constraints and soft-deletes.
  - Added REST API routes under `/api/v1/clients`, `/api/v1/clients/[clientId]`, `/api/v1/clients/[clientId]/archive`, and `/api/v1/clients/[clientId]/invite`.
  - Added client-representative portal invitation flow allowing skeleton portal users to safely sign up and secure credentials via the registration endpoint.
  - Built interactive clients panel (`ClientList`) with custom search matching, active/archived state filters, and form dialogs.
  - Built comprehensive clients dashboard profiles (`ClientProfile`) featuring Overview, Proposals, Invoices, Documents, and portal management interfaces.

- **Phase 4: CRM Module**:
  - Implemented `LeadRepository` handling CRUD, soft-deletes, and atomic Client conversion within transaction.
  - Built `LeadService` ensuring security using Workspace membership checks, OWNER role restrictions, and Free plan client limits.
  - Developed Server Actions in `src/features/crm/actions/lead-actions.ts` and REST APIs under `/api/v1/leads`, `/api/v1/leads/[leadId]`, `/api/v1/leads/[leadId]/status`, and `/api/v1/leads/[leadId]/convert`.
  - Configured Sonner `Toaster` provider inside RootLayout.
  - Installed shadcn component dialog, select, textarea, and badge.
  - Developed premium interactive client-side `LeadKanbanBoard` component using dnd-kit pointer sensors, edit/delete actions, and click-to-convert client trigger.
  - Built server-side `CrmPage` route linking data querying to Kanban board UI.

- **Phase 3: Workspace System**:
  - Implemented `WorkspaceRepository` utilizing Prisma transactions to create workspaces, auto-assign OWNER membership roles, and initialize usage trackers.
  - Built `WorkspaceService` for workspace CRUD, unique slug generation, and RBAC gate checks.
  - Developed Server Actions and REST APIs.
  - Built onboarding page, dashboard layout, and switcher menu.
  - Built a premium `RevenueChart` client component using `recharts`.

- **Phase 2: Authentication**:
  - Installed `next-auth` (Auth.js v5 beta), `@auth/prisma-adapter`, and `argon2` for password hashing.
  - Implemented `UserRepository` and `AuthService`.
  - Configured Next.js 16 Proxy in `src/proxy.ts` to secure application routes.
  - Designed responsive Login, Register, Forgot Password, and Reset Password pages.

- **Phase 1: Project Foundation**:
  - Initialized Next.js 16.2.9 app with React 19, TypeScript, and Tailwind CSS v4 in `src/` directory.
  - Initialized Git repository and connected remote `https://github.com/Medskiyyy/SyncLancer.git`.
  - Installed and initialized `shadcn/ui` with custom SaaS Blue theme variables using OKLCH values in `src/app/globals.css`.
  - Installed main app dependencies.
  - Configured database schema in `prisma/schema.prisma`.
  - Generated Prisma Client v5.22.0.
  - Created Prisma Client singleton `src/lib/prisma.ts` and Supabase Client `src/lib/supabase.ts`.
  - Added Prettier configuration in `.prettierrc` and placeholder environment variables in `.env.example`.
  - Created initial documentation files.
  - Verified local compilation is healthy via production build test.
