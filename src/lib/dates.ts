/**
 * @file dates.ts
 * Pure date-utility functions and constants for the calendar.
 * No side effects, no DOM access — safe to use in any context (client or server).
 */

import type { CalendarCell } from "@/types/calendar";

/** Full month names indexed 0–11 (January–December). */
export const MONTHS = [
  "January", "February", "March",     "April",   "May",      "June",
  "July",    "August",   "September", "October", "November", "December",
] as const;

/**
 * Column headers for the calendar grid.
 * Week starts on Monday (ISO 8601); Saturday and Sunday are treated as weekends.
 */
export const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * Returns the number of days in a given month.
 * Uses the "day 0 of next month" trick to avoid month-length lookup tables.
 *
 * @param year  - Full calendar year (e.g. 2025).
 * @param month - 0-indexed month (0 = January, 11 = December).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the 0-indexed weekday (Mon = 0 … Sun = 6) of the first day of the month.
 * Used to calculate how many leading blank cells to prepend in the grid.
 *
 * @param year  - Full calendar year.
 * @param month - 0-indexed month.
 */
export function getFirstDayMon(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
  // Remap Sunday (0) to position 6; shift Mon–Sat left by one.
  return day === 0 ? 6 : day - 1;
}

/**
 * Returns `true` when two `Date` objects represent the same calendar day,
 * regardless of time-of-day or timezone offset.
 *
 * @param a - First date.
 * @param b - Second date.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/**
 * Returns `true` when `date` falls strictly between `start` and `end` (both exclusive).
 * Handles inverted ranges (start > end) by normalising to [lo, hi] internally.
 *
 * @param date  - The date to test.
 * @param start - One endpoint of the range.
 * @param end   - The other endpoint of the range.
 */
export function isStrictlyBetween(date: Date, start: Date, end: Date): boolean {
  const [lo, hi] = start <= end ? [start, end] : [end, start];
  return date > lo && date < hi;
}

/**
 * Formats a date as a short human-readable string: `"Jan 5"`, `"Dec 25"`, etc.
 * Used as display labels and as `localStorage` keys for single-day notes.
 *
 * @param date - The date to format.
 */
export function formatShort(date: Date): string {
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// ─── buildCells params ───────────────────────────────────────────────────────

interface BuildCellsParams {
  year:      number;
  month:     number;
  today:     Date;
  startDate: Date | null;
  endDate:   Date | null;
  hoverDate: Date | null;
  /** When `true`, the hover date acts as a live preview for the range end. */
  picking:   boolean;
  /** Map of `"month-day"` keys (e.g. `"8-15"`) to holiday names. */
  holidays:  Record<string, string>;
}

/**
 * Builds the complete flat array of `CalendarCell` objects for a month view.
 *
 * The array always contains a multiple-of-7 number of cells so the grid
 * renders full rows. Overflow cells from the previous and next months are
 * included to fill the first and last partial weeks.
 *
 * All derived state — today highlight, selection, range, holiday — is resolved
 * here in a single pass so `CalendarGrid` and `DayCell` remain pure and
 * require no business logic.
 *
 * @param params - See {@link BuildCellsParams}.
 * @returns Flat array of cells in row-major (Mon → Sun, top → bottom) order.
 */
export function buildCells(params: BuildCellsParams): CalendarCell[] {
  const { year, month, today, startDate, endDate, hoverDate, picking, holidays } = params;

  const firstDay    = getFirstDayMon(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevDays    = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  // Round up to the nearest full week.
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // While the user is picking an end date, treat the hovered day as a live preview.
  const effectiveEnd = picking ? hoverDate : endDate;

  return Array.from({ length: totalCells }, (_, i): CalendarCell => {
    const col       = i % 7;
    const isWeekend = col >= 5; // columns 5 (Sat) and 6 (Sun)

    // ── Overflow: previous month ──────────────────────────────────────────
    if (i < firstDay) {
      return {
        day:       prevDays - firstDay + i + 1,
        type:      "prev",
        isWeekend,
        isToday:   false,
        isStart:   false,
        isEnd:     false,
        isInRange: false,
      };
    }

    // ── Overflow: next month ──────────────────────────────────────────────
    if (i >= firstDay + daysInMonth) {
      return {
        day:       i - firstDay - daysInMonth + 1,
        type:      "next",
        isWeekend,
        isToday:   false,
        isStart:   false,
        isEnd:     false,
        isInRange: false,
      };
    }

    // ── Current month ─────────────────────────────────────────────────────
    const day  = i - firstDay + 1;
    const date = new Date(year, month, day);
    // Holiday lookup key: "month-day" with no leading zeros, e.g. "8-15".
    const hk   = `${month + 1}-${day}`;

    return {
      day,
      date,
      type:      "cur",
      isWeekend,
      isToday:   isSameDay(date, today),
      isStart:   !!startDate    && isSameDay(date, startDate),
      isEnd:     !!effectiveEnd && isSameDay(date, effectiveEnd),
      isInRange: !!startDate && !!effectiveEnd
                   && isStrictlyBetween(date, startDate, effectiveEnd),
      holiday:   holidays[hk],
    };
  });
}
