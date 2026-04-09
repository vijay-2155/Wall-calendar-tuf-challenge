"use client";
/**
 * @file WallCalendar.tsx
 * Root composition component — assembles all calendar sub-components and wires
 * state hooks together.
 *
 * Rendering tree:
 *   <main>                         ← page background (wall texture)
 *     <div wrapper>                ← constrains width, positions nail
 *       nail decoration
 *       <div card>                 ← white card with drop-shadow
 *         <SpiralBinding />        ← decorative ring strip (28 px)
 *         [peel overlay]           ← absolute, shown only during animation
 *         <HeroImage />            ← full-bleed photo (252 px)
 *         month title strip        ← accent triangle + month name + nav arrows
 *         <div row>
 *           <NotesPanel />         ← 160 px sidebar
 *           <CalendarGrid />       ← flex-1 day grid
 *         </div>
 *       </div>
 *     </div>
 *   </main>
 *
 * ### Page-peel animation
 * When the user navigates months, `useCalendarState` immediately commits the
 * new month and raises a `flipping` flag. This component responds by rendering
 * an absolutely-positioned overlay that replicates the *previous* month's hero
 * image and title strip. A CSS `clip-path` animation peels the overlay away
 * (up for forward, down for backward), revealing the already-rendered new
 * content beneath — exactly like lifting a physical calendar page.
 */

import { useMemo } from "react";
import Image from "next/image";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useNotes }         from "@/hooks/useNotes";
import { SpiralBinding }    from "@/components/SpiralBinding";
import { HeroImage }        from "@/components/HeroImage";
import { CalendarGrid }     from "@/components/CalendarGrid";
import { NotesPanel }       from "@/components/NotesPanel";
import { MONTHS, formatShort, isSameDay, getDaysInMonth } from "@/lib/dates";
import { MONTH_IMAGES, MONTH_ACCENT_COLORS } from "@/lib/monthImages";

/**
 * Top-level wall calendar component.
 * Compose-only — delegates all state to `useCalendarState` and `useNotes`.
 */
export function WallCalendar() {
  const cal = useCalendarState();

  /**
   * Derives the `localStorage` key for the currently active note context.
   *
   * Priority:
   *   1. A multi-day range  → `"Jan 5 – Jan 10"`
   *   2. A single day       → `"Jan 5"`
   *   3. Whole month        → `"January 2025"`
   */
  const noteKey = useMemo(() => {
    if (cal.startDate && cal.endDate && !isSameDay(cal.startDate, cal.endDate)) {
      return `${formatShort(cal.startDate)} \u2013 ${formatShort(cal.endDate)}`;
    }
    if (cal.startDate) return formatShort(cal.startDate);
    return `${MONTHS[cal.month]} ${cal.year}`;
  }, [cal.startDate, cal.endDate, cal.month, cal.year]);

  const notes = useNotes(noteKey);

  /**
   * All notes written on individual dates of the current month, in day order.
   * Used by NotesPanel to render the "This Month's Plans" list.
   */
  const monthPlans = useMemo(() => {
    const prefix = MONTHS[cal.month].slice(0, 3);
    const days   = getDaysInMonth(cal.year, cal.month);
    const plans  = [];
    for (let d = 1; d <= days; d++) {
      const key = `${prefix} ${d}`;
      if (notes.store[key]) plans.push({ key, day: d, text: notes.store[key] });
    }
    return plans;
  }, [notes.store, cal.month, cal.year]);

  /**
   * CSS animation class applied to the peel overlay.
   * - `animate-page-peel-up`   — forward navigation (page lifts upward).
   * - `animate-page-peel-down` — backward navigation (page drops downward).
   * - `null`                   — no animation; overlay is not rendered.
   */
  const peelClass = cal.flipping
    ? (cal.flipDir === 1 ? "animate-page-peel-up" : "animate-page-peel-down")
    : null;

  return (
    <main
      className="min-h-screen flex items-center justify-center p-8 max-sm:p-0"
      style={{ background: "linear-gradient(160deg, #dce4ea 0%, #c8d4dc 50%, #d4dde4 100%)" }}
      onClick={cal.clearSelection}
    >
      {/* Outer wrapper — constrains max-width, position context for nail, pivot for swing.
          stopPropagation so clicks inside the card don't bubble up and clear the selection. */}
      <div className="relative w-full max-w-[460px] animate-calendar-swing max-sm:animate-none">

        {/*
         * Wall screw — SVG Phillips-head screw rendered in 3D layers:
         *   1. Soft ambient shadow (blurred circle behind the head)
         *   2. Cylindrical shaft with left-right metallic gradient
         *   3. Head drop-shadow (offset circle for depth)
         *   4. Head disc with radial chrome gradient (lit top-left)
         *   5. Outer edge ring + inner chamfer groove
         *   6. Phillips cross slots (horizontal + vertical), each with a
         *      thin highlight stripe to simulate slot depth
         *   7. Two-tier specular highlight on the head surface
         */}
        <div className="no-print absolute -top-[30px] left-1/2 -translate-x-1/2 z-20 pointer-events-none max-sm:hidden">
          <svg width="30" height="44" viewBox="0 0 30 44" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Chrome-like radial gradient, light source top-left */}
              <radialGradient id="wn-head" cx="34%" cy="26%" r="68%">
                <stop offset="0%"   stopColor="#f4f8fa" />
                <stop offset="18%"  stopColor="#e0eaf0" />
                <stop offset="52%"  stopColor="#9eb8c6" />
                <stop offset="82%"  stopColor="#688898" />
                <stop offset="100%" stopColor="#486070" />
              </radialGradient>
              {/* Cylindrical shaft gradient (left → right) */}
              <linearGradient id="wn-shaft" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#3a5060" />
                <stop offset="32%"  stopColor="#9ab8c6" />
                <stop offset="52%"  stopColor="#ccdee8" />
                <stop offset="100%" stopColor="#304050" />
              </linearGradient>
              {/* Gaussian blur for ambient shadow */}
              <filter id="wn-blur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>

            {/* 1. Ambient shadow on wall surface */}
            <circle cx="15" cy="16" r="13" fill="rgba(0,0,0,0.20)" filter="url(#wn-blur)" />

            {/* 2. Shaft going into the binding */}
            <rect x="13.5" y="23" width="3" height="21" rx="1.5" fill="url(#wn-shaft)" />
            {/* Shaft specular stripe */}
            <rect x="14.3" y="23" width="1" height="21" rx="0.5" fill="rgba(255,255,255,0.28)" />

            {/* 3. Head drop-shadow (slightly offset down) */}
            <circle cx="15" cy="16" r="12" fill="rgba(0,0,0,0.28)" />

            {/* 4. Head disc */}
            <circle cx="15" cy="13" r="12" fill="url(#wn-head)" />

            {/* 5a. Outer edge bevel */}
            <circle cx="15" cy="13" r="11.5" fill="none"
              stroke="rgba(0,0,0,0.24)" strokeWidth="0.8" />
            {/* 5b. Inner chamfer groove */}
            <circle cx="15" cy="13" r="9" fill="none"
              stroke="rgba(0,0,0,0.12)" strokeWidth="1.4" />
            <circle cx="15" cy="13" r="9" fill="none"
              stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />

            {/* 6. Phillips cross — horizontal arm */}
            <rect x="8.5" y="12.2" width="13" height="1.6" rx="0.8"
              fill="rgba(0,0,0,0.44)" />
            <rect x="8.5" y="12.7" width="13" height="0.5" rx="0.25"
              fill="rgba(255,255,255,0.12)" />
            {/* Phillips cross — vertical arm */}
            <rect x="14.2" y="6.5" width="1.6" height="13" rx="0.8"
              fill="rgba(0,0,0,0.44)" />
            <rect x="14.7" y="6.5" width="0.5" height="13" rx="0.25"
              fill="rgba(255,255,255,0.12)" />

            {/* 7. Two-tier specular highlight */}
            <ellipse cx="10.5" cy="8.5" rx="4" ry="2.6"
              fill="rgba(255,255,255,0.46)"
              transform="rotate(-30 10.5 8.5)" />
            <ellipse cx="10" cy="7.8" rx="2" ry="1.3"
              fill="rgba(255,255,255,0.64)"
              transform="rotate(-30 10 7.8)" />
          </svg>
        </div>

        {/* ── Calendar card ───────────────────────────────────────────────── */}
        <div
          role="region"
          aria-label="Wall Calendar"
          className="w-full bg-white rounded-sm overflow-hidden relative print-shadow"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28), 0 4px 14px rgba(0,0,0,0.16), 0 1px 3px rgba(0,0,0,0.1)" }}
        >

          <SpiralBinding />

          {/*
           * ── Page-peel overlay ────────────────────────────────────────────
           *
           * Rendered only while `cal.flipping` is true (i.e. during the 600 ms
           * animation window). It sits above all card content (z-30) and
           * reproduces the *previous* month's visual so the user sees a real
           * page lifting away rather than a blank white sheet.
           *
           * The overlay is positioned below the spiral binding (top: 28px) and
           * fills the remaining card height. `overflow-hidden` prevents the
           * child image from bleeding past the card's rounded corners.
           *
           * Clip-path is animated by the CSS keyframes in globals.css:
           *   - page-peel-up:   inset(0 0 0 0) → inset(0 0 100% 0)  [bottom recedes up]
           *   - page-peel-down: inset(0 0 0 0) → inset(100% 0 0 0)  [top recedes down]
           * A `drop-shadow` filter follows the clip edge, simulating a peel-line shadow.
           */}
          {peelClass && cal.prevMonth !== null && cal.prevYear !== null && (
            <div
              className={`absolute left-0 right-0 bottom-0 z-30 pointer-events-none overflow-hidden ${peelClass}`}
              aria-hidden="true"
              style={{ top: "46px", background: "#fff" }}
            >
              {/* Previous month's hero image */}
              <div className="relative overflow-hidden bg-[#1a3a52]" style={{ height: "252px" }}>
                <Image
                  src={MONTH_IMAGES[cal.prevMonth]}
                  alt=""
                  fill
                  sizes="460px"
                  className="object-cover"
                />
                {/* Diagonal accent triangle using the previous month's colour */}
                <svg
                  viewBox="0 0 460 60"
                  preserveAspectRatio="none"
                  className="absolute bottom-0 left-0 w-full h-[60px]"
                >
                  <polygon points="0,60 0,0 253,60" fill={MONTH_ACCENT_COLORS[cal.prevMonth]} />
                </svg>
              </div>

              {/* Previous month's title strip */}
              <div className="relative flex items-center bg-white" style={{ minHeight: "64px" }}>
                <svg
                  viewBox="0 0 460 64"
                  preserveAspectRatio="none"
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <polygon points="0,0 230,0 0,64" fill={MONTH_ACCENT_COLORS[cal.prevMonth]} opacity="0.92" />
                </svg>
                <div className="relative z-10 ml-auto pr-4 py-3 text-right leading-none">
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: MONTH_ACCENT_COLORS[cal.prevMonth], textTransform: "uppercase" as const }}>
                    {cal.prevYear}
                  </p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "38px", fontWeight: 800, letterSpacing: "0.03em", lineHeight: 1.05, color: "#111" }}>
                    {MONTHS[cal.prevMonth].toUpperCase()}
                  </p>
                </div>
              </div>

              {/* White fill representing the note + grid area of the old page */}
              <div style={{ background: "#fff", minHeight: "280px" }} />
            </div>
          )}

          {/* ── Hero image (current month) ─────────────────────────────────── */}
          <HeroImage
            month={cal.month}
            year={cal.year}
            imgLoaded={cal.imgLoaded}
            onLoad={() => cal.setImgLoaded(true)}
            onPrev={() => cal.navigate(-1)}
            onNext={() => cal.navigate(1)}
            today={cal.today}
          />

          {/* ── Month title strip ──────────────────────────────────────────── */}
          <div
            className="relative flex items-center bg-white border-b border-[var(--color-border)]"
            style={{ minHeight: "64px" }}
          >
            {/*
             * Accent triangle — mirrors the one on the hero image, creating a
             * continuous diagonal motif that crosses the photo/strip boundary.
             */}
            <svg
              viewBox="0 0 460 64"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <polygon points="0,0 230,0 0,64" fill="var(--color-blue)" opacity="0.92" />
            </svg>

            {/* Previous month button — sits on the accent triangle (white icon) */}
            <button
              onClick={() => cal.navigate(-1)}
              aria-label="Previous month"
              className="no-print relative z-10 ml-3 w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
              style={{ background: "rgba(255,255,255,0.22)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.38)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Month + year — right-aligned on the white portion of the strip */}
            <div className="relative z-10 ml-auto pr-4 py-3 text-right leading-none">
              <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "var(--color-blue)", textTransform: "uppercase" }}>
                {cal.year}
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "38px", fontWeight: 800, letterSpacing: "0.03em", lineHeight: 1.05, color: "#111" }}>
                {MONTHS[cal.month].toUpperCase()}
              </p>
            </div>

            {/* Next month button — sits on the white area (accent icon) */}
            <button
              onClick={() => cal.navigate(1)}
              aria-label="Next month"
              className="no-print relative z-10 mr-3 ml-2 w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] transition-colors duration-150 cursor-pointer bg-white hover:bg-[var(--color-blue-light)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* ── Bottom row: notes sidebar + calendar grid ──────────────────── */}
          <div className="flex items-stretch max-sm:flex-col" onClick={(e) => e.stopPropagation()}>
            <NotesPanel
              noteKey={noteKey}
              noteText={notes.noteText}
              setNoteText={notes.setNoteText}
              autoSaved={notes.autoSaved}
              onSave={notes.saveNote}
              monthPlans={monthPlans}
              onPlanClick={(day) => cal.selectDate(new Date(cal.year, cal.month, day))}
              onDeletePlan={notes.deleteNote}
              picking={cal.picking}
              hasSelection={!!cal.startDate}
              onClear={cal.clearSelection}
            />

            <CalendarGrid
              year={cal.year}
              month={cal.month}
              today={cal.today}
              startDate={cal.startDate}
              endDate={cal.endDate}
              hoverDate={cal.hoverDate}
              picking={cal.picking}
              onDayClick={cal.handleDayClick}
              onDayHover={cal.setHover}
              notesStore={notes.store}
              hasSelection={!!cal.startDate}
              onClear={cal.clearSelection}
            />
          </div>

        </div>{/* end calendar card */}
      </div>{/* end wrapper */}
    </main>
  );
}
