# SyncLancer UI/UX Specification

SyncLancer is a data-dense freelance operations workspace. The interface should feel like a practical working tool for repeated daily use: calm, scan-friendly, fast, and consistent across dashboard, CRM, projects, invoices, files, settings, and client portal.

## Product Direction

- **Pattern:** Data-Dense + Drill-Down
- **Primary use case:** Freelancers managing clients, proposals, projects, time, files, invoices, and workspace limits.
- **Design benchmark:** Linear, Stripe Dashboard, Vercel dashboard, Attio-style operational clarity.
- **Avoid:** Luxury branding, liquid glass, decorative glows, generic sparkle badges, oversized marketing composition, and non-standard Tailwind shade names unless explicitly defined as compatibility aliases.

## Color System

The production source of truth is `src/app/globals.css`.

- **Background:** `#F8FAFC` for app canvas.
- **Surface:** `#FFFFFF` cards, tables, dialogs, and panels.
- **Text:** `#0F172A` for primary text, `#334155` for secondary, `#64748B` for muted text.
- **Border:** `#E2E8F0` for default divisions, `#CBD5E1` for stronger input boundaries.
- **Primary:** `#2563EB` for main actions, active navigation, links, and chart focus.
- **Semantic:** success `#059669`, warning `#D97706`, destructive `#DC2626`, info `#0284C7`.

Use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`) before hardcoded palettes.

## Typography

- **Font:** system Inter-style stack from `globals.css`; no remote CSS font import.
- **Page title:** `text-2xl` to `text-3xl`, `font-semibold`, `tracking-tight`.
- **Section/card title:** `text-base`, `font-semibold`.
- **Table/body text:** `text-sm`.
- **Dense metadata:** `text-xs`; avoid `text-[9px]` except compact badges.
- **Letter spacing:** normal by default; uppercase labels can use small positive tracking sparingly.

## Layout System

- **Desktop shell:** fixed left sidebar, 240-260px width, non-floating utility panel.
- **Header:** 64px sticky toolbar with breadcrumb, workspace search, notifications, and profile affordance.
- **Main content:** max width `1440px`, padding `24px` desktop, `16px` mobile.
- **Cards/panels:** default radius `8px`; use larger radius only for dialogs or intentionally isolated modules.
- **Tables:** 48px header rows, 56-60px body rows, aligned `px-6`, visible hover state, actions right-aligned.
- **Kanban:** 280px columns, horizontal scroll, clear status colors, no decorative blurred backgrounds.

## Component Rules

- Use one icon family in product UI. Prefer `lucide-react` for new or redesigned components.
- Interactive elements need visible hover and focus states.
- Hover must not shift layout. Avoid `hover:scale` on cards and file tiles.
- Empty states must include a domain-specific next action where useful.
- Copy should be concrete and operational: say what will happen, not marketing adjectives.
- Charts should use semantic colors and real empty states instead of blank frames.
- Client portal can be slightly friendlier, but should still share the same token system.

## AI Slop Guardrails

- Do not use `Sparkles`, "premium", "liquid glass", "magic", "unlock absolute", "scale without borders", or fake real-time labels like "Updated: Just now" unless backed by data.
- Do not introduce arbitrary palette steps such as `zinc-450` in new code. Existing aliases remain temporarily for migration.
- Do not mix slate, zinc, stone, indigo, gold, and violet as competing brand systems.
- Do not put cards inside cards unless the inner item is a repeated entity row/card.
- Do not use decorative blobs, orbs, mesh gradients, or blur fields in app surfaces.

## Redesign Priorities

1. Normalize tokens and base components.
2. Convert shell and dashboard to operational command-center layouts.
3. Standardize tables, toolbars, status badges, dialogs, and empty states.
4. Remove legacy shade aliases from feature code once each screen is migrated.
5. Verify with lint, responsive screenshots, and dark/light contrast checks.
