/**
 * @file calendar.ts
 * Shared TypeScript types for the wall calendar application.
 * These are pure data shapes — no UI or business logic.
 */

/**
 * Indicates which month a grid cell belongs to.
 * - `"prev"` — overflow day from the previous month (greyed out)
 * - `"cur"`  — a day in the currently displayed month (interactive)
 * - `"next"` — overflow day from the next month (greyed out)
 */
export type CellType = "prev" | "cur" | "next";

/**
 * All visual and interaction state for a single calendar grid cell.
 * Computed once in `buildCells()` so presentational components remain pure.
 */
export interface CalendarCell {
  /** Display number shown in the cell (1–31, or overflow day number). */
  day: number;
  /**
   * The full `Date` object for this cell.
   * Only present when `type === "cur"`; overflow cells omit this.
   */
  date?: Date;
  /** Which month this cell belongs to. */
  type: CellType;
  /** `true` when the column index is Saturday (5) or Sunday (6). */
  isWeekend: boolean;
  /** `true` when this cell represents today's date. */
  isToday: boolean;
  /** `true` when this cell is the start of the selected date range. */
  isStart: boolean;
  /** `true` when this cell is the end of the range, or the live hover preview during picking. */
  isEnd: boolean;
  /** `true` for days strictly between `isStart` and `isEnd` (exclusive endpoints). */
  isInRange: boolean;
  /** Holiday name for this date, if any (e.g. `"Independence Day"`). Omitted when not a holiday. */
  holiday?: string;
}

/**
 * Shape of the notes object persisted in `localStorage`.
 * Keys are note identifiers (a date, range, or month string); values are the note body.
 *
 * @example
 * {
 *   "Jan 5": "Meeting with team",
 *   "Jan 5 – Jan 10": "Road trip",
 *   "January 2025": "Monthly goals"
 * }
 */
export interface NotesStore {
  [noteKey: string]: string;
}

/**
 * Direction of month navigation.
 * `1` = forward (next month), `-1` = backward (previous month).
 */
export type NavDirection = 1 | -1;
