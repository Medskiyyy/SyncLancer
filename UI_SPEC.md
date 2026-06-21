# SyncLancer UI/UX Design System Specification

This document specifies the premium SaaS design system applied to SyncLancer. The theme aligns with modern SaaS products like Attio, Stripe, Linear, and Vercel, utilizing a high-contrast, clean Slate/Blue light-mode-first aesthetic.

---

## 1. Color System

SyncLancer employs a unified color system defined in `globals.css` using CSS custom properties.

### Foundation Palette (Slate)
- **Background**: `#F8FAFC` (Slate 50) - Soft light-mode page canvas.
- **Card Background**: `#FFFFFF` (White) - Elevated surface container blocks.
- **Borders**: `#E2E8F0` (Slate 200) - Clean, thin boundaries.
- **Body Text**: `#64748B` (Slate 500 / Slate 600) - High-legibility charcoal gray.
- **Headings**: `#0F172A` (Slate 900) - Pure dark slate for premium emphasis.

### Accent & Chart Colors
- **Primary Blue**: `#2563EB` (Blue 600) - Signature branding color.
- **Secondary Blue**: `#3B82F6` (Blue 500) - Alternative highlights.
- **Accent Cyan**: `#06B6D4` (Cyan 500) - Informational/highlight accent.
- **Success (Green)**: `#10B981` - Positive status indicators (PAID, COMPLETED).
- **Warning (Amber)**: `#F59E0B` - Attention indicators (ON_HOLD, SENT).
- **Danger (Red)**: `#EF4444` - Critical indicators (OVERDUE, CANCELLED).
- **Grid Lines**: `#E2E8F0` - Soft lines for chart grids.

---

## 2. Typography & Hierarchy

Clean, readable typography using the Inter font family with strict font-size hierarchy for high-density SaaS views.

- **Page Title**: `32px` (`text-3xl font-bold tracking-tight text-slate-900`)
- **Section Title**: `24px` (`text-2xl font-semibold tracking-tight text-slate-900`)
- **Card Title / Table Title**: `16px` (`text-base font-bold text-slate-900`)
- **Body / Content text**: `14px` (`text-sm font-medium text-slate-600`)
- **Subtext / Meta info**: `12px` (`text-xs text-slate-500`)

---

## 3. Layout Specifications

Standardized layout dimensions ensure visual alignment across all pages.

- **Desktop Sidebar**: Fixed `260px` width. Sidebar navigation menu items have a list height of `44px` (`h-11`). Active state transition is background-only with a left blue border.
- **Workspace Switcher**: Switcher card height is `72px` (`h-[72px]`), displaying a `40x40` (`h-10 w-10`) avatar.
- **Top Header**: Height of `64px` (`h-16`).
- **Workspace Settings**: Maximum content width is set to exactly `900px` (`max-w-[900px]`), displaying exactly 6 settings tabs: General, Workspace, Branding, Billing, Notifications, and Security.

---

## 4. Spacing & Grid Metrics

Specific component structures define the spacing system.

- **Kanban Board columns**: Exactly `280px` wide, separated by a `16px` gap. Column header text uses Title casing and the label "Lead" instead of generic names.
- **List Tables**: Table header height is `48px` (`h-[48px]`), and row height is `60px` (`h-[60px]`). Headers are aligned px-6. Row click targets are mapped directly on client/project names.
- **Files Grid View**: Google Drive-style layout showing folder categories (Documents, Images, Archives, Others) at the top, and files in a 4-column card grid below. Card height is exactly `120px` (`h-[120px]`).
- **Dashboard KPIs**: Card heights are exactly `120px` (`h-[120px]`). Greeting card is exactly `160px` (`h-[160px]`). Quick Actions card is exactly `88px` (`h-[88px]`).

---

## 5. Transitions & Micro-Interactions

Interactive states are optimized for high perceived performance.

- **Page Transition (Enter)**: Custom layout animation wrapping App Router pages.
  - Duration: `180ms`
  - Opacity: `0 → 1`
  - TranslateY: `8px → 0`
- **Card Hover**: Cards scale slightly with a soft lift effect.
  - Scale: `1 → 1.02`
  - Duration: `150ms`
- **Button Hover**:
  - Duration: `150ms`
- **Sidebar Navigation**:
  - Background transition only (no sliding overlay).
  - Duration: `150ms`

---

## 6. Charts & Empty States

Standards for analytical dashboards to ensure usefulness and styling consistency.

- **Revenue Chart**: Height is `360px`. Filled area uses a blue gradient (`#2563EB` to Transparent).
- **Projects Status Chart**: Height is `360px`. Bars mapped to individual status colors.
- **Empty States**: Never render empty charts or lists. If data is absent, show an icon, helpful descriptive message, and a contextual call-to-action button (e.g. "Create Invoice").
