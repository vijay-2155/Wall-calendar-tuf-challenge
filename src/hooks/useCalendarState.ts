"use client";
/**
 * @file useCalendarState.ts
 * Central state hook for the wall calendar.
 *
 * Owns all calendar-level state: the displayed month/year, date-range
 * selection, page-peel animation, and keyboard navigation. Business logic
 * is isolated here so presentational components remain stateless.
 */

import { useState, useCallback, useEffect } from "react";
import { isSameDay }           from "@/lib/dates";
import { MONTH_ACCENT_COLORS } from "@/lib/monthImages";
import type { NavDirection }   from "@/types/calendar";

/** Duration (ms) that the page-peel CSS animation runs. Must match globals.css. */
const PEEL_DURATION_MS = 600;

/**
 * Manages all interactive state for the wall calendar.
 *
 * ### State managed
 * - **month / year** — the currently displayed month.
 * - **prevMonth / prevYear** — snapshot of the month *before* a navigation,
 *   consumed by the peel overlay so users see the old page lifting away.
 * - **startDate / endDate** — the selected date range (null when nothing is selected).
 * - **picking** — `true` while the user is choosing the range end date.
 * - **hoverDate** — the day currently under the cursor during picking (range preview).
 * - **flipping** — `true` while the page-peel animation is running.
 * - **flipDir** — direction of the last navigation (`1` = next, `-1` = prev).
 * - **imgLoaded** — `true` once the hero image for the current month has loaded.
 *
 * ### Side effects
 * - Updates the CSS custom property `--color-blue` whenever the month changes,
 *   applying the curated accent colour for that month across the whole UI.
 * - Registers global `keydown` listeners for ← / → (navigation) and Escape (clear selection).
 */
export function useCalendarState() {
  const today = new Date();

  // ── Displayed month ───────────────────────────────────────────────────────
  const [year,      setYear]      = useState(today.getFullYear());
  const [month,     setMonth]     = useState(today.getMonth());

  // ── Date-range selection ──────────────────────────────────────────────────
  const [startDate, setStart]     = useState<Date | null>(null);
  const [endDate,   setEnd]       = useState<Date | null>(null);
  const [picking,   setPicking]   = useState(false);
  const [hoverDate, setHover]     = useState<Date | null>(null);

  // ── Page-peel animation ───────────────────────────────────────────────────
  const [flipping,  setFlipping]  = useState(false);
  const [flipDir,   setFlipDir]   = useState<NavDirection>(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  /** Snapshot of the month index before the last navigation (drives the peel overlay). */
  const [prevMonth, setPrevMonth] = useState<number | null>(null);
  /** Snapshot of the year before the last navigation (drives the peel overlay). */
  const [prevYear,  setPrevYear]  = useState<number | null>(null);

  // ── Accent colour ─────────────────────────────────────────────────────────
  /**
   * Sync the CSS accent colour to the current month.
   * Done via a CSS custom property so every component picks it up automatically
   * without prop drilling.
   */
  useEffect(() => {
    document.documentElement.style.setProperty("--color-blue", MONTH_ACCENT_COLORS[month]);
  }, [month]);

  // ── Navigation ────────────────────────────────────────────────────────────
  /**
   * Advances or reverses the displayed month.
   *
   * The new month is committed immediately so its content renders behind the
   * peel overlay. After `PEEL_DURATION_MS` the overlay is unmounted and the
   * snapshot (`prevMonth` / `prevYear`) is cleared.
   *
   * Debounced via the `flipping` guard — rapid clicks are ignored mid-animation.
   *
   * @param dir - `1` to go forward one month, `-1` to go back.
   */
  const navigate = useCallback((dir: NavDirection) => {
    if (flipping) return; // debounce: ignore clicks during animation

    // Snapshot current month so the peel overlay can render the old page.
    setPrevMonth(month);
    setPrevYear(year);

    setFlipDir(dir);
    setFlipping(true);
    setImgLoaded(false);

    // Update the displayed month immediately — new content appears behind the overlay.
    setMonth((m) => {
      if (dir === 1) {
        if (m === 11) { setYear((y) => y + 1); return 0; }
        return m + 1;
      } else {
        if (m === 0) { setYear((y) => y - 1); return 11; }
        return m - 1;
      }
    });

    // Tear down the overlay once the CSS animation has finished.
    setTimeout(() => {
      setFlipping(false);
      setPrevMonth(null);
      setPrevYear(null);
    }, PEEL_DURATION_MS);
  }, [flipping, month, year]);

  // ── Date-range selection ──────────────────────────────────────────────────
  /**
   * Handles a tap/click on a calendar day cell.
   *
   * First click sets the range start and enters "picking" mode.
   * Second click sets the range end. If the same day is clicked twice the
   * selection is cancelled. If the end date precedes the start date the two
   * are automatically swapped so the range is always chronological.
   *
   * @param date - The calendar date that was clicked.
   */
  const handleDayClick = useCallback((date: Date) => {
    if (!picking) {
      // Start a new range — enter picking mode waiting for end date.
      setStart(date);
      setEnd(null);
      setPicking(true);
    } else {
      if (isSameDay(date, startDate!)) {
        // Clicking the start date again cancels the selection.
        setPicking(false);
        return;
      }
      // Normalise: ensure start is always before end.
      if (date < startDate!) {
        setStart(date);
        setEnd(startDate);
      } else {
        setEnd(date);
      }
      setPicking(false);
      setHover(null);
    }
  }, [picking, startDate]);

  /**
   * Clears the entire date-range selection and exits picking mode.
   * Also bound to the Escape key via the global keyboard handler.
   */
  const clearSelection = useCallback(() => {
    setStart(null);
    setEnd(null);
    setPicking(false);
    setHover(null);
  }, []);

  /**
   * Selects a single date directly (e.g. when tapping a note in the plans list).
   * Sets both start and end to the same date so the cell is highlighted.
   *
   * @param date - The date to select.
   */
  const selectDate = useCallback((date: Date) => {
    setStart(date);
    setEnd(date);
    setPicking(false);
    setHover(null);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  /** Global keyboard shortcuts: ← prev month, → next month, Escape clear selection. */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "Escape")     clearSelection();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, clearSelection]);

  return {
    today, year, month,
    prevMonth, prevYear,
    startDate, endDate,
    picking, hoverDate,
    flipping, flipDir,
    imgLoaded,
    setHover, setImgLoaded,
    navigate, handleDayClick, clearSelection, selectDate,
  };
}
