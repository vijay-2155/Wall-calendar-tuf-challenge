# Wall Calendar

> A polished, interactive wall calendar component built for the TakeUForward Frontend Engineering Challenge.

**Author:** Vijay Kumar Tholeti  
**GitHub:** [@Vijay-2155](https://github.com/Vijay-2155)  
**Live Demo:** https://wall-calendar-amber.vercel.app

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

- **No external libraries for dates** — all date logic is written from scratch in `src/lib/dates.ts`, keeping the bundle light and the logic easy to follow.

- **All state in custom hooks** — `useCalendarState` handles navigation and range picking, `useNotes` handles saving to localStorage. Components just receive props and render — no business logic inside them.

- **Grid is pre-computed** — `buildCells()` figures out every cell's state (today, selected, in range, holiday, overflow) before passing it to the grid. The grid component itself just loops and renders.

- **Page-peel animation** — when you navigate, the new month loads instantly in the background. The old month's image and title are shown on a layer on top, which then peels away using a CSS animation — so it looks like lifting a real calendar page.

- **Per-month colour theming** — each month has its own accent colour. It's applied as a single CSS variable on the root element, so every button, highlight, and heading updates automatically with no extra code.

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
