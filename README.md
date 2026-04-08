# Wall Calendar

> A polished, interactive wall calendar component built for the TakeUForward Frontend Engineering Challenge.

**Author:** Vijay Kumar Tholeti  
**GitHub:** [@Vijay-2155](https://github.com/Vijay-2155)  
**Live Demo:** _[Add Vercel URL after deployment]_

---

## Preview

The calendar renders as a physical wall calendar hung on a nail — complete with a spiral coil binding, monthly hero photography, and a page-peel animation when navigating between months.

---

## Features

### Core (Required)
- **Wall calendar aesthetic** — SVG Phillips-head screw nail, 3-layer metallic spiral coil binding, full-bleed monthly hero photo with diagonal accent triangle
- **Day range selector** — click a start date, hover for live preview, click to confirm end date; selected days, range fill, and endpoints each have distinct visual states
- **Integrated notes** — sidebar notepad tied to the active context (selected day, date range, or whole month); persisted to `localStorage` with graceful fallback
- **Fully responsive** — side-by-side panels on desktop, vertically stacked on mobile with touch-friendly tap targets

### Creative Extras
- **Page-peel animation** — when navigating months, the old page visibly lifts away (CSS `clip-path` animation) revealing the new month underneath, exactly like peeling a real calendar page
- **Page-load pendulum swing** — on first render the calendar swings and settles on the nail, simulating a freshly hung wall calendar (damped pendulum keyframes, pivot at the nail head)
- **Per-month accent colours** — each month has a curated accent colour applied via a CSS custom property (`--color-blue`), theming the header triangle, day highlights, and UI controls
- **Holiday markers** — Indian public holidays (2025) are marked with a dot indicator and show the holiday name on hover
- **Print stylesheet** — `@media print` hides all decorative chrome (nail, binding, nav arrows) and removes box shadows for a clean printed grid
- **ARIA** — `role="grid"`, `role="row"`, `aria-label` on all interactive elements

---

## Tech Stack

| Tool | Version | Reason |
|---|---|---|
| Next.js | 16.2 (App Router) | File-based routing, `next/image`, `next/font`, React Server Components |
| React | 19 | Latest concurrent renderer; React Compiler enabled |
| Tailwind CSS | v4 | CSS-first config via `@theme` — no `tailwind.config.ts` needed |
| TypeScript | 5 | Strict mode, zero `any` |
| pnpm | 9 | Fast, disk-efficient package manager |

---

## Architecture

### No external calendar or date libraries
All date arithmetic lives in [`src/lib/dates.ts`](src/lib/dates.ts) — pure functions that are trivial to unit-test without any framework.

### State isolated in custom hooks
- [`useCalendarState`](src/hooks/useCalendarState.ts) — month navigation, date range picking, flip animation state
- [`useNotes`](src/hooks/useNotes.ts) — localStorage read/write with a saved-flash UX

Presentational components receive everything as props and hold zero `useState`.

### `buildCells()` pre-computes the entire grid
[`buildCells()`](src/lib/dates.ts) returns a flat array of ~42 typed cell descriptors (previous-month overflow, current-month days, next-month overflow) with all boolean flags pre-resolved (`isToday`, `isSelected`, `inRange`, `isHoliday`, etc.). `CalendarGrid` and `DayCell` are purely declarative over this array.

### Page-peel technique
`useCalendarState` snapshots `prevMonth`/`prevYear` before committing the new month. `WallCalendar` renders the new month immediately beneath a `z-30` overlay that replicates the old month's hero image and title strip. A CSS `clip-path: inset()` animation shrinks the overlay from one edge to the other — old content visibly peels away, new content is already rendered underneath.

### Accent colours via CSS custom property
`useCalendarState` calls `document.documentElement.style.setProperty("--color-blue", color)` on every navigation. Every accent-coloured element reads `var(--color-blue)`, so the entire UI repaints with no prop drilling or context.

---

## Run Locally

```bash
# 1. Clone
git clone https://github.com/Vijay-2155/wall-calendar.git
cd wall-calendar

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm dev

# open http://localhost:3000
```

### Build check

```bash
pnpm run build   # must complete with zero errors and zero warnings
```

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens (@theme), keyframes, utility classes
│   ├── layout.tsx           # Font loading (Barlow, Barlow Condensed), metadata
│   └── page.tsx             # Root page — renders <WallCalendar />
├── components/
│   ├── WallCalendar.tsx     # Root composition — wires all sub-components + peel overlay
│   ├── SpiralBinding.tsx    # SVG coil binding strip (painter's algorithm, 3-layer wire)
│   ├── HeroImage.tsx        # Full-bleed monthly photo with diagonal accent SVG
│   ├── CalendarGrid.tsx     # 7-col month grid + legend
│   ├── DayCell.tsx          # Individual day cell with all visual states
│   └── NotesPanel.tsx       # Sidebar notepad
├── hooks/
│   ├── useCalendarState.ts  # Navigation, range picking, flip animation
│   └── useNotes.ts          # localStorage note persistence
├── lib/
│   ├── dates.ts             # buildCells(), DAY_HEADERS, MONTHS, date utils
│   ├── holidays.ts          # Indian public holiday data (2025)
│   └── monthImages.ts       # Hero image URLs + per-month accent colour palette
└── types/
    └── calendar.ts          # Shared TypeScript types (CellDescriptor, etc.)
```

---

*Built with care by Vijay Kumar Tholeti.*
