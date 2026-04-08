/**
 * @file monthImages.ts
 * Static asset data for the wall calendar: hero photos and accent colours,
 * one entry per month (indices 0–11 map to January–December).
 *
 * Photos are sourced from Unsplash at w=900 for a good quality/size trade-off.
 * Accent colours are hand-picked to complement each photo rather than being
 * sampled at runtime (canvas colour extraction produces muddy averages for
 * richly-saturated nature images).
 */

/**
 * Per-month accent colour used for buttons, headers, and the diagonal SVG
 * overlay on the hero image. Each value is chosen to harmonise with the
 * corresponding photo in `MONTH_IMAGES`.
 *
 * Index matches month number (0 = January, 11 = December).
 */
export const MONTH_ACCENT_COLORS: readonly string[] = [
  "#1d7fc4", // Jan  – icy blue       (ice climber)
  "#4a6fa5", // Feb  – deep slate blue (snowy peaks)
  "#2e8b57", // Mar  – forest green    (forest path)
  "#c45c1a", // Apr  – amber/terracotta(wildflowers)
  "#3a9e4a", // May  – fresh green     (green field)
  "#1a8fa8", // Jun  – teal ocean      (beach)
  "#5a6fa0", // Jul  – mountain dusk   (mountain peaks)
  "#1d7fc4", // Aug  – waterfall blue  (waterfall)
  "#2e6b9e", // Sep  – aerial lake blue(aerial lake)
  "#b05c1a", // Oct  – autumn orange   (autumn road)
  "#4a6080", // Nov  – winter steel    (snow trail)
  "#1d5c9e", // Dec  – frozen lake blue(frozen lake)
] as const;

/**
 * Per-month hero images displayed in the upper portion of the calendar card.
 * All images are adventure / nature themed to match a physical wall calendar aesthetic.
 *
 * Index matches month number (0 = January, 11 = December).
 * The `images.unsplash.com` hostname is whitelisted in `next.config.ts`.
 */
export const MONTH_IMAGES: readonly string[] = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80", // Jan  – ice climber
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80", // Feb  – snowy peaks
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80", // Mar  – forest path
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=900&q=80", // Apr  – wildflowers
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80", // May  – green field
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80", // Jun  – beach
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80", // Jul  – mountain peaks
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=900&q=80", // Aug  – waterfall
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80", // Sep  – aerial lake
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80", // Oct  – autumn road
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80", // Nov  – snow trail
  "https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=900&q=80", // Dec  – frozen lake
] as const;
