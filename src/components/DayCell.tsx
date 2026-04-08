"use client";
/**
 * @file DayCell.tsx
 * Individual day cell rendered inside the calendar grid.
 *
 * Derives all visual styles from the pre-computed `CalendarCell` data object
 * rather than containing its own business logic — style decisions (colours,
 * backgrounds, border-radii) are the only logic present here.
 *
 * Visual layers (bottom → top):
 *   1. Cell background — shows range highlight colour.
 *   2. Day number circle — filled for start/end, tinted for today.
 *   3. Holiday dot — a small coloured pip below the number.
 *   4. Holiday tooltip — appears on hover, rendered above all other content.
 */

import { useState } from "react";
import type { CalendarCell } from "@/types/calendar";

/** Props accepted by {@link DayCell}. */
interface DayCellProps {
  /** Pre-computed cell data produced by `buildCells()`. */
  cell: CalendarCell;
  /** Called when the user clicks a current-month day. */
  onClick: () => void;
  /** Called when the cursor enters a current-month day (range preview). */
  onMouseEnter: () => void;
  /** Called when the cursor leaves a current-month day. */
  onMouseLeave: () => void;
}

/**
 * Renders a single calendar day cell with full visual state applied.
 *
 * Only cells with `type === "cur"` are interactive. Overflow cells (`"prev"` /
 * `"next"`) render as muted numbers with no click handling.
 */
export function DayCell({ cell, onClick, onMouseEnter, onMouseLeave }: DayCellProps) {
  const { day, type, isToday, isStart, isEnd, isInRange, isWeekend, holiday } = cell;
  const [hovered, setHovered] = useState(false);
  const isCur = type === "cur";

  // ── Derive number-circle styles ───────────────────────────────────────────
  let numBg    = "transparent";
  let numColor = isCur ? (isWeekend ? "var(--color-blue)" : "#222") : "#ccc";
  let fontW    = 400;

  if (isStart || isEnd) {
    // Solid filled circle for range endpoints.
    numBg    = "var(--color-blue)";
    numColor = "#fff";
    fontW    = 700;
  } else if (isToday) {
    // Lightly tinted circle for today (when not selected).
    numBg    = "var(--color-blue-light)";
    numColor = "var(--color-blue-dark)";
    fontW    = 600;
  }

  // ── Derive cell background and border-radius for range highlight ──────────
  let cellBg = "transparent";
  let radius  = "3px";

  if (isInRange)                       cellBg = "var(--color-blue-light)";
  if (isInRange && !isStart && !isEnd) radius = "0";           // flush mid-range
  if (isStart)                         radius = "3px 0 0 3px"; // rounded left cap
  if (isEnd)                           radius = "0 3px 3px 0"; // rounded right cap

  return (
    <div
      role={isCur ? "gridcell" : "presentation"}
      aria-label={isCur && cell.date ? cell.date.toDateString() : undefined}
      aria-selected={isStart || isEnd || undefined}
      onClick={isCur ? onClick : undefined}
      onMouseEnter={() => { if (isCur) { setHovered(true);  onMouseEnter(); } }}
      onMouseLeave={() => { if (isCur) { setHovered(false); onMouseLeave(); } }}
      className={`relative flex flex-col items-center justify-start py-1 min-h-[36px] select-none ${
        isCur ? "cursor-pointer hover:bg-[#f0f8fe] transition-colors duration-100" : "cursor-default"
      }`}
      style={{ background: cellBg, borderRadius: radius }}
    >
      {/* Day number — displayed inside a circular badge */}
      <span
        className="flex items-center justify-center w-[26px] h-[26px] rounded-full text-[12px] transition-all duration-100"
        style={{ background: numBg, color: numColor, fontWeight: fontW }}
      >
        {day}
      </span>

      {/* Holiday dot — small accent pip below the number */}
      {holiday && isCur && (
        <div
          className="w-[4px] h-[4px] rounded-full mt-[2px] opacity-80"
          style={{
            // Use white on filled endpoints so the dot remains visible.
            background: (isStart || isEnd) ? "#fff" : "var(--color-blue)",
          }}
        />
      )}

      {/* Holiday tooltip — rendered above siblings via z-index, visible on hover only */}
      {holiday && isCur && hovered && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#111] text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 pointer-events-none"
          role="tooltip"
        >
          {holiday}
        </span>
      )}
    </div>
  );
}
