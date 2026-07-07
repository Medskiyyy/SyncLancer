# SyncLancer Design System Master

> When a page-specific file exists under `design-system/pages/`, it may override this file. Otherwise, use this master specification.

## Category

Operational SaaS dashboard for freelance business management.

## Style

**Data-Dense + Drill-Down**

SyncLancer should optimize for scanning, comparison, repeated actions, and confidence. The app is a work surface, not a marketing landing page. Visual polish comes from alignment, hierarchy, density control, and clear feedback.

## Palette

| Role | Hex | CSS Variable |
| --- | --- | --- |
| Background | `#F8FAFC` | `--background` |
| Surface | `#FFFFFF` | `--card` |
| Foreground | `#0F172A` | `--foreground` |
| Muted Text | `#64748B` | `--muted-foreground` |
| Border | `#E2E8F0` | `--border` |
| Primary | `#2563EB` | `--primary` |
| Success | `#059669` | `--success` |
| Warning | `#D97706` | `--warning` |
| Destructive | `#DC2626` | `--destructive` |

Dark mode uses the same semantic roles with a slate canvas and blue primary.

## Typography

- **Primary font:** system Inter-style stack from `globals.css`.
- **Heading weight:** `600`, not black/heavy by default.
- **Body weight:** `400-500`.
- **Data/amounts:** `font-mono` is allowed for currency, timers, invoice IDs, and compact metrics.

## Spacing

| Token | Usage |
| --- | --- |
| `8px` | Icon gaps, compact controls |
| `12px` | Dense row/card internal gaps |
| `16px` | Component padding |
| `24px` | Page padding and section gaps |
| `32px` | Large page group separation |

## Components

### Buttons

- Default height: `32px`.
- Primary actions use `bg-primary`.
- Secondary actions use outline/ghost variants.
- Icons should be lucide unless a legacy file has not been migrated yet.

### Cards

- Radius: `8px`.
- Border: `border-border`.
- Shadow: minimal `shadow-sm`.
- No glass, blur, gradient mesh, or decorative glow by default.

### Tables

- Header: `48px`, `text-xs`, muted.
- Rows: `56-60px`.
- Primary entity cell should be a direct link.
- Row hover must be color-only.

### Empty States

- Include a concise reason and the next best action.
- Do not use generic celebratory or "magic" language.

## Forbidden Patterns

- Liquid glass as the app default.
- Decorative glows, bokeh, or gradient blobs.
- Sparkle icons for ordinary CRUD.
- Non-standard Tailwind shade names in new code.
- Hover scale on operational cards.
- Marketing copy inside settings, billing, CRM, invoices, or files.
