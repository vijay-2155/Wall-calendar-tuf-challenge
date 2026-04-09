"use client";
/**
 * @file CalendarGrid.tsx
 * Renders the 7-column month grid: day-of-week headers, day cells, and legend.
 *
 * This component is intentionally pure — it receives all state as props and
 * delegates cell rendering to `DayCell`. All grid data is produced by
 * `buildCells()`, which isolates the date-arithmetic in a single, testable place.
 *
 * Layout (left to right, top to bottom):
 *   Mon  Tue  Wed  Thu  Fri  Sat  Sun   ← day headers
 *   [ prev-month overflow cells ]
 *   [ current-month day cells   ]
 *   [ next-month overflow cells ]
 *   ──────────────────────────────
 *   ● selected  ■ in range  • holiday  SAT weekend  ← legend
 */

import { buildCells, DAY_HEADERS, formatShort } from "@/lib/dates";
import { HOLIDAYS }                              from "@/lib/holidays";
import { DayCell }                               from "@/components/DayCell";
import type { NotesStore }                       from "@/types/calendar";

/** Props accepted by {@link CalendarGrid}. */
interface CalendarGridProps {
  /** Full calendar year being displayed. */
  year: number;
  /** 0-indexed month being displayed (0 = January). */
  month: number;
  /** Today's date — used to highlight the current day. */
  today: Date;
  /** Start of the selected date range, or `null` if nothing is selected. */
  startDate: Date | null;
  /** End of the selected date range, or `null` during picking / no selection. */
  endDate: Date | null;
  /** Day currently under the cursor during range picking (live preview end date). */
  hoverDate: Date | null;
  /** `true` while the user is choosing the range end date. */
  picking: boolean;
  /** Callback fired when a current-month day is clicked. */
  onDayClick: (date: Date) => void;
  /** Callback fired when the cursor enters / leaves a current-month day. */
  onDayHover: (date: Date | null) => void;
  /** Full notes store — used to look up each day's saved note for inline display. */
  notesStore: NotesStore;
  /** `true` when at least a start date is selected — shows the clear button. */
  hasSelection: boolean;
  /** Clears the current date selection. */
  onClear: () => void;
}

/**
 * Pure presentational component that renders the calendar month grid.
 *
 * Cell data is computed from props via `buildCells()` on each render — this
 * is an O(n) operation over ~42 cells and is negligible compared to React's
 * reconciliation cost.
 */
export function CalendarGrid({
  year, month, today, startDate, endDate,
  hoverDate, picking, onDayClick, onDayHover, notesStore,
  hasSelection, onClear,
}: CalendarGridProps) {
  const cells = buildCells({
    year, month, today, startDate, endDate, hoverDate, picking,
    holidays: HOLIDAYS,
  });

  return (
    <div className="flex-1 p-2 pb-3">

      {/* Day-of-week header row */}
      <div className="grid grid-cols-7 gap-[2px] mb-1" role="row">
        {DAY_HEADERS.map((label, i) => (
          <div
            key={label}
            className="text-center text-[10px] font-bold uppercase tracking-wide py-1"
            // Weekend column headers (Sat, Sun) use the accent colour.
            style={{ color: i >= 5 ? "var(--color-blue)" : "#666" }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div
        className="grid grid-cols-7 gap-[2px]"
        role="grid"
        aria-label={`Calendar for ${month + 1}/${year}`}
      >
        {cells.map((cell, i) => (
          <DayCell
            key={i}
            cell={cell}
            noteText={cell.type === "cur" && cell.date ? (notesStore[formatShort(cell.date)] || undefined) : undefined}
            onClick={()     => cell.type === "cur" && cell.date && onDayClick(cell.date)}
            onMouseEnter={() => cell.type === "cur" && cell.date && onDayHover(cell.date)}
            onMouseLeave={() => onDayHover(null)}
          />
        ))}
      </div>

      {/* Legend + clear button row */}
      <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex items-center gap-3 flex-wrap">
        {[
          { shape: "circle", label: "selected" },
          { shape: "square", label: "in range"  },
          { shape: "dot",    label: "holiday"   },
          { shape: "text",   label: "weekend"   },
        ].map(({ shape, label }) => (
          <div key={label} className="flex items-center gap-1">
            {shape === "circle" && <div className="w-[10px] h-[10px] rounded-full bg-[var(--color-blue)]" />}
            {shape === "square" && <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--color-blue-light)] border border-[var(--color-blue-mid)]" />}
            {shape === "dot"    && <div className="w-[5px] h-[5px] rounded-full bg-[var(--color-blue)]" />}
            {shape === "text"   && <span className="text-[9px] font-bold text-[var(--color-blue)]">SAT</span>}
            <span className="text-[9px] text-[#888]">{label}</span>
          </div>
        ))}

        {/* Clear selection — always visible on desktop and mobile when active */}
        {hasSelection && (
          <button
            onClick={onClear}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold cursor-pointer transition-colors"
            style={{ background: "var(--color-blue)", color: "#fff" }}
            aria-label="Clear date selection"
          >
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-2 h-2">
              <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
            </svg>
            Clear
          </button>
        )}
      </div>

    </div>
  );
}
