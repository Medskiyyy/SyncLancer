# SyncLancer UI/UX Design System Specification

This document specifies the premium design system applied to SyncLancer. The theme aligns with modern SaaS products like Attio, Stripe, Linear, Notion, and Framer, utilizing a warm, organic Stone gray foundation highlighted with vibrant Amber/Gold accents.

---

## 1. Color System

SyncLancer employs a unified color system defined in `globals.css` using CSS custom properties.

### Foundation Palette (Stone)
- **Background (Light)**: `#fafaf9` (Stone 50) - Warm, soft background avoiding sterile white.
- **Background (Dark)**: `#0c0a09` (Stone 950) - Rich deep obsidian black.
- **Foreground (Light)**: `#1c1917` (Stone 900) - Premium high-contrast charcoal.
- **Foreground (Dark)**: `#fafaf9` (Stone 50) - Warm chalk white.
- **Cards (Light)**: `#ffffff` (White)
- **Cards (Dark)**: `#1c1917` (Stone 900) - Sleek elevated container block.
- **Borders (Light)**: `#e7e5e4` (Stone 200) - Crisp thin boundaries.
- **Borders (Dark)**: `#292524` (Stone 800) - Subtle dark-mode lines.

### Accent Palette (Gold/Amber)
- **Primary / Ring**: `#ca8a04` (Amber 600) - Gold accent signifying professional status.
- **Muted Accents**: `rgba(202, 138, 4, 0.1)` (Amber 600 at 10% opacity) - Translucent highlights.
- **Selection Highlight**: `selection:bg-amber-100 selection:text-amber-900` - Warm context select color.

---

## 2. Typography & Hierarchy

Clean, readable sans-serif typography with strict scaling for SaaS readability.

- **Main Header (H1)**: `text-2xl md:text-3xl font-extrabold tracking-tight`
- **Section Title (H2)**: `text-lg md:text-xl font-bold tracking-tight`
- **Card Titles (H3)**: `text-sm font-bold tracking-wider uppercase text-zinc-450`
- **Body Text**: `text-xs md:text-sm font-medium text-zinc-650 dark:text-zinc-450`
- **Subtext / Meta info**: `text-[10px] md:text-xs font-semibold text-zinc-400`
- **Monospace (Numbers / Codes)**: `font-mono` - Enforces uniform spacing for pricing, IDs, and dates.

---

## 3. Borders & Shadows

Crisp boundaries define the Linear/Stripe design language.

- **Standard Border**: `border border-zinc-200/60 dark:border-zinc-800/80` (thin, semi-translucent crisp lines).
- **Elevated Border**: `border-zinc-250 dark:border-zinc-800` (for high priority highlights).
- **Border Radius**: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons/inputs, `rounded` (4px) for badges.
- **Glassmorphic blur**: `.glass-card` (backdrop filter with white/obsidian translucent blends) for headers.
- **Shadows**: Thin, soft elevations avoiding heavy blur:
  - Standard Card: `shadow-xs`
  - Hover Card Elevation (`.hover-lift`): Translates `translateY(-2px)` with shadow expansion `box-shadow: 0 12px 24px -10px rgba(9, 9, 11, 0.08)`.

---

## 4. Components & Interactive States

Interactive components must feel tactile and responsive.

### Click Targets Enforcements
- All clickable buttons, sidebar items, and tab buttons must explicitly feature the class `cursor-pointer`.
- Active buttons implement a focus outline: `focus-visible:ring-1 focus-visible:ring-primary/40`.

### Active / Selected States
- **Sidebar Nav Links**: Active items receive a left border highlight `border-l-2 border-primary rounded-l-none` and background tint `bg-zinc-150 dark:bg-zinc-800`.
- **Notion Tabs**: Tabs display a bordered pill design `bg-zinc-100 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-50 border-zinc-200/40 dark:border-zinc-800`.
- **Hover Transitions**: Transitions apply `transition-all duration-150` or `duration-250` for smooth animations.

---

## 5. Layout Specifications

Responsive scaffolding for both desktop workspaces and mobile views.

- **Desktop Sidebar**: Fixed `w-64` left-side navigation with scrollable contents.
- **Desktop Main Area**: Placed at `pl-64` on viewports `>= md`.
- **Mobile Header**: Dynamic topbar `h-14` featuring absolute overlay backdrop-blur (`bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md`).
- **Mobile Sidebar Drawer**: Hamburger-triggered sliding left panel (`animate-in slide-in-from-left duration-250`) with overlay dismiss target.

---

## 6. Feature Layout Standards

Specific UI patterns used across SyncLancer features.

### CRM Lead Kanban Board
- Columns are container boxes styled with faint theme borders. Tapping cards enables full drag-and-drop triggers.
- Active card items stack details (email, phone, company name) in high-density blocks.
- **Won** columns expose a premium gold button: "Convert to Client".

### Attio-style Clients Directory
- Client directories employ a dense row table instead of card grids.
- Company logos display dynamic letter initials inside warm background badges (`bg-amber-500/10 text-amber-600 border border-amber-500/15`).
- Active scopes display custom progress bar widgets with a gold gradient overlay.

### Document-like Proposal Views
- Proposals display as a physical sheet document centered on the screen, highlighted by a gold gradient border.
- Pricing tables render with translucent stone backgrounds (`bg-zinc-50/50 dark:bg-zinc-900/30`) and bold monospace totals.
