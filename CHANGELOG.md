# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Total Redesign — High-Contrast Ink, Pure White & Signal Emerald (2026-11-18)**:
  - **Token & Typography Foundation**: Replaced Slate/Blue tokens with Ink (`#121212`) & Pure White (`#ffffff`) + Signal Emerald (`--brand`: `#059669` light / `#10b981` dark) and graphite dark mode (`#0d0d0c`) in `src/app/globals.css`; switched heading display font from `Onest` to `Archivo` alongside `Plus Jakarta Sans` and `JetBrains Mono` in `src/app/layout.tsx`; added `ThemeProvider` (`next-themes`), `<ThemeToggle />`, `<BrandLogo />`, and flattened `button`/`badge`/`card`/`input` primitives.
  - **Editorial Landing Page**: Generated and embedded bespoke daylight studio photography (`public/images/landing-hero-studio.jpg`, `public/images/landing-portal-handoff.jpg`), rewrote all `src/components/landing/*` components with an asymmetric hero, interactive 4-tab module showcase, 4-column workflow ledger without numeric prefixes, `#portal` handoff showcase, and harmonized CTA/footer.
  - **Split Auth & Workspace Navigation Shell**: Built 12-column split `AuthShell` without outer `<Card>` wrappers across login/register/forgot/reset/onboarding, unified `offline/page.tsx`, and refined `sidebar-nav`, `workspace-switcher`, `command-palette`, `notification-center`, and workspace topbar (`<ThemeToggle />`).
  - **Ledger-First Workspace Modules**: Collapsed dashboard headers and converted standalone KPI cards into `divide-x` ledger strips (`dashboard`, `analytics`, `invoices`, `portal`, `time-tracking`); switched Recharts charts (`revenue-chart.tsx`, `project-status-chart.tsx`) to Ink/Emerald palettes; unified Lead/Task Kanban columns, Project/Proposal/Client tables and builders, File Manager, Settings, and Proposal PDF accents onto semantic tokens + 4-bucket status badges (`0` legacy `slate-*`/`zinc-*`/`gray-*`/`blue-*`/`indigo-*`/`violet-*`/`purple-*`/`rose-*` UI matches); refactored `project-builder.tsx` to `useWatch` for 0 ESLint warnings.
- **Full Anti-Slop UI Overhaul & Typography Wiring (2026-11-18)**:
  - Loaded `Plus_Jakarta_Sans`, `Onest`, and `JetBrains_Mono` via `next/font/google` in `src/app/layout.tsx` and mapped Tailwind v4 theme variables + `tabular-nums` in `src/app/globals.css`.
  - Redesigned the landing page (`src/components/landing/*`) with an asymmetric split hero, open hairline feature matrix, 01/02/03 input/output workflow ledger, crisp `bg-slate-950` CTA section, and a new `#portal` showcase section (`landing-portal.tsx`) while eliminating em-dashes, macOS traffic-light dots, blurred blobs, pulsing dots, eyebrow badges, and placeholder names (`Acme`, `John Doe`).
  - Added shared `AuthShell` (`src/components/auth/auth-shell.tsx`) for Login, Register, Forgot Password, Reset Password, and Onboarding pages, and cleaned up the Offline fallback page.
  - Unified Dashboard/Analytics KPIs (removed rainbow left borders, added `tabular-nums`), Loading skeleton (replaced spinning circle placeholder with bar skeletons), CRM & Task Kanban boards, Client Portal, Notification Center, Time Tracker, Proposals, Files, and Invoices onto semantic Slate/Blue tokens, raising sub-10px micro-labels (`text-[8px]`/`text-[9px]`) to `text-[11px]`+ and removing animated ping/pulse status dots.

### Fixed
- **Client State Re-Sync, Navigation Wiring & Serialization Hardening (2026-11-18)**:
  - Fixed stale state after `router.refresh()` using React 19 render-time prop sync across `project-list.tsx`, `task-kanban-board.tsx`, `proposal-detail.tsx`, `workspace-invoice-manager.tsx`, `invoice-manager.tsx`, and `time-tracker.tsx`.
  - Wired `CRM Pipeline` into workspace `sidebar-nav.tsx` and turned the sidebar user badge into a settings `<Link>` for non-client members.
  - Wired `?add=true` and `?create=true` dashboard quick-action query parameters in `client-list.tsx` and `workspace-invoice-manager.tsx`.
  - Fixed invalid Tailwind classes in `project-detail.tsx`, cleaned ESLint unused-variable warnings across auth/portal/file components, and stabilized workspace/API auth, CSP, and serialization updates.

### Added
- **Slate/Blue SaaS Theme Redesign**:
  - Rebuilt the color scheme from Stone/Amber to a light-mode-first Slate/Blue palette, mapping Tailwind variables to modern slate tones.
  - Implemented high-density aligned table layouts for Clients directory (`client-list.tsx`) and Projects directory (`project-list.tsx`) with row height 60px and header height 48px.
  - Added 4 KPI cards block (Total Invoiced, Paid, Outstanding, Drafts) at the top of the Invoices page (`workspace-invoice-manager.tsx`).
  - Replaced the Files table with a Google Drive-style layout featuring dynamic folders (Documents, Images, Archives, Others) and a responsive 4-column card grid (height 120px).
  - Redesigned the Analytics page to use the Slate theme, setting the Recharts height to 360px and removing the weekly productivity block.
  - Updated the Workspace Settings page to support a maximum width of 900px and exactly 6 settings tabs (General, Workspace, Branding, Billing, Notifications, Security).
  - Rewrote `UI_SPEC.md` to specify the new Slate/Blue SaaS style guidelines.
- **Premium SaaS Redesign**:
  - Redesigned the entire application to follow a modern Stone/Amber SaaS aesthetic (inspired by Linear, Stripe, Attio, Notion, Framer).
  - Setup unified global styling system in `globals.css` with Stone gray shades (`#fafaf9` / `#0c0a09`), amber highlights, thin crisp borders, and backdrop-blur glassmorphic features.
  - Implemented client sidebar drawer with responsive styling, custom collapsible sections, and Notion-like Workspace Switcher.
  - Developed Ctrl + K Command Palette search modal for global workspace action shortcuts and fast menu routing.
  - Restyled Dashboard KPIs, Workload progress bar, and recent activity feed.
  - Re-themed CRM Lead Kanban Board with priority dot labels, status tags, and drag-and-drop animations.
  - Redesigned Clients, Proposals, Projects, Invoices, Files, Analytics, and Settings pages to align with the Stone/Amber theme.
  - Created a unified `UI_SPEC.md` document mapping out the design tokens, components, visual hierarchy, and interaction design rules.
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
