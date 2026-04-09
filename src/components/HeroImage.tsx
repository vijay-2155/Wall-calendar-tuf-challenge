"use client";
/**
 * @file HeroImage.tsx
 * Full-bleed hero photograph section at the top of the calendar card.
 *
 * Renders the current month's Unsplash photo with:
 * - A fade-in transition once the image has loaded (avoids layout-shift flash).
 * - A diagonal SVG accent triangle overlaid at the bottom-left corner that
 *   visually bridges the photo into the month-title strip below.
 * - A "today" date badge at the top-right corner.
 * - Hidden prev/next ghost buttons over the photo (additional tap targets on
 *   mobile — the main nav arrows live in the month strip below).
 */

import Image from "next/image";
import { MONTHS }       from "@/lib/dates";
import { MONTH_IMAGES } from "@/lib/monthImages";

/** Props accepted by {@link HeroImage}. */
interface HeroImageProps {
  /** 0-indexed month (0 = January). Drives which photo is displayed. */
  month: number;
  /** Full calendar year — used only for the image `alt` text. */
  year: number;
  /** `true` once the `<img>` element has fired its `load` event. */
  imgLoaded: boolean;
  /** Callback invoked when the underlying `<img>` fires `onLoad`. */
  onLoad: () => void;
  /** Navigate to the previous month. */
  onPrev: () => void;
  /** Navigate to the next month. */
  onNext: () => void;
  /** Today's date — displayed in the top-right badge. */
  today: Date;
}

/**
 * Renders the full-bleed hero photo for a given month.
 *
 * The component is intentionally display-only: all navigation callbacks are
 * wired externally by `WallCalendar`, keeping this component pure and easy
 * to test in isolation.
 */
export function HeroImage({
  month, year, imgLoaded, onLoad, onPrev, onNext, today,
}: HeroImageProps) {
  return (
    <div className="relative overflow-hidden bg-[#1a3a52] h-[252px] max-sm:h-[160px]">
      {/*
       * Full-bleed photo.
       * `key={month}` ensures Next.js treats each month as a distinct image,
       * triggering a fresh fade-in rather than swapping src on the same element.
       */}
      <Image
        key={month}
        src={MONTH_IMAGES[month]}
        alt={`${MONTHS[month]} ${year} hero image`}
        fill
        priority
        sizes="460px"
        className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={onLoad}
      />

      {/*
       * Diagonal accent triangle — SVG overlay that bleeds from the bottom-left
       * corner into the month strip, creating a visual diagonal across the card.
       * Uses `--color-blue` (updated per-month) so it matches the accent colour.
       */}
      <svg
        viewBox="0 0 460 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full h-[60px] pointer-events-none"
      >
        <polygon points="0,60 0,0 253,60" fill="var(--color-blue)" />
      </svg>

      {/* Today's date badge — full date on desktop, day + month only on mobile. */}
      <div className="no-print absolute top-3 right-3 z-10 bg-white/90 rounded px-2 py-1 text-[11px] font-semibold tracking-wide text-[var(--color-blue)] whitespace-nowrap">
        <span className="max-sm:hidden">
          {today.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span className="sm:hidden">
          {today.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Ghost prev/next tap zones over the photo (mobile convenience targets). */}
      <button
        onClick={onPrev}
        aria-label="Previous month"
        className="no-print absolute left-0 inset-y-0 w-1/4 cursor-pointer"
        tabIndex={-1}
      />
      <button
        onClick={onNext}
        aria-label="Next month"
        className="no-print absolute right-0 inset-y-0 w-1/4 cursor-pointer"
        tabIndex={-1}
      />
    </div>
  );
}
