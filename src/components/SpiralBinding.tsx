/**
 * @file SpiralBinding.tsx
 * Premium spiral coil binding strip — SVG-rendered with a 3-layer tubular wire effect.
 *
 * Render order (painter's algorithm):
 *   1. Subtle background gradient   — top-of-page surface
 *   2. Polished metallic channel    — blue-steel strip with ridge + bevels
 *   3. Metallic rim around each hole
 *   4. Deep punched holes           — radial gradient for depth
 *   5. Back-arc (low opacity)       — wire passing behind the page
 *   Mask: cover lower half of rings so wire appears to pass behind the calendar
 *   6. Front-arc shadow stroke      — wide dark stroke = underside of round wire
 *   7. Front-arc main stroke        — mid-tone silver gradient
 *   8. Front-arc specular stroke    — thin bright line = top-lit highlight
 *   9. Drop-shadow filter on loops  — lifts each loop visually off the surface
 *
 * Hidden in print (`no-print`) — printed output shows only the grid.
 */

const RING_COUNT = 18;   // fewer rings → more refined, less cluttered

// ── SVG viewport ─────────────────────────────────────────────────────────────
const VW = 460;
const VH = 46;

// ── Binding channel ───────────────────────────────────────────────────────────
const STRIP_TOP = 16;
const STRIP_BOT = 32;
const STRIP_MID = (STRIP_TOP + STRIP_BOT) / 2; // 24

// ── Wire ring ─────────────────────────────────────────────────────────────────
const RX   = 8;     // horizontal radius
const RY   = 15;    // vertical radius   (elongated oval)
const WIRE = 3;     // main stroke width

export function SpiralBinding() {
  const step = VW / (RING_COUNT + 1);
  const xs   = Array.from({ length: RING_COUNT }, (_, i) => step * (i + 1));

  /** SVG arc path string for the top half of ring at x-centre `cx`. */
  const topArc = (cx: number, rx = RX, ry = RY, offset = 0) =>
    `M ${cx - rx} ${STRIP_MID + offset} A ${rx} ${ry} 0 0 0 ${cx + rx} ${STRIP_MID + offset}`;

  return (
    <div
      className="no-print relative z-10"
      style={{ height: VH }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={VH}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Background: subtle warm-white top-of-page surface ── */}
          <linearGradient id="sc-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f0f4f6" />
            <stop offset="100%" stopColor="#e8eef2" />
          </linearGradient>

          {/* ── Channel: polished blue-steel gradient ── */}
          <linearGradient id="sc-strip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#8fa0ac" />
            <stop offset="18%"  stopColor="#c8d8e2" />
            <stop offset="42%"  stopColor="#ddeaf2" />
            <stop offset="58%"  stopColor="#ccdae4" />
            <stop offset="82%"  stopColor="#a8bcca" />
            <stop offset="100%" stopColor="#7a909e" />
          </linearGradient>

          {/* ── Wire main colour: top-lit silver (user-space y coords) ── */}
          <linearGradient
            id="sc-wire"
            x1="0" y1={STRIP_MID - RY}
            x2="0" y2={STRIP_MID}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#dce8f0" />
            <stop offset="35%"  stopColor="#b0c4d0" />
            <stop offset="100%" stopColor="#6a8090" />
          </linearGradient>

          {/* ── Wire shadow underside (user-space) ── */}
          <linearGradient
            id="sc-wire-shadow"
            x1="0" y1={STRIP_MID - RY}
            x2="0" y2={STRIP_MID}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#2a3c48" />
            <stop offset="100%" stopColor="#3a5060" />
          </linearGradient>

          {/* ── Hole: deep punched-through darkness ── */}
          <radialGradient id="sc-hole" cx="50%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#121e26" />
            <stop offset="60%"  stopColor="#1e2e38" />
            <stop offset="100%" stopColor="#304050" />
          </radialGradient>

          {/* ── Rim: thin metallic ring around hole ── */}
          <linearGradient id="sc-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#b0c0cc" />
            <stop offset="100%" stopColor="#7a8e9a" />
          </linearGradient>

          {/*
           * Drop-shadow filter — applied to each front arc group.
           * Creates a soft shadow below each loop, lifting them visually
           * off the channel surface.
           */}
          <filter id="sc-loop-shadow" x="-30%" y="-30%" width="160%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#1a2c38" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* ── 1. Page surface background ── */}
        <rect x="0" y="0" width={VW} height={VH} fill="url(#sc-bg)" />

        {/* ── 2. Metallic binding channel ── */}
        <rect x="0" y={STRIP_TOP} width={VW} height={STRIP_BOT - STRIP_TOP}
          fill="url(#sc-strip)" />

        {/* Top bevel: hard shadow line + soft highlight */}
        <rect x="0" y={STRIP_TOP}      width={VW} height="1.5" fill="rgba(0,0,0,0.32)" />
        <rect x="0" y={STRIP_TOP + 2}  width={VW} height="1"   fill="rgba(255,255,255,0.28)" />

        {/* Centre ridge — subtle horizontal groove down the middle of the channel */}
        <rect x="0" y={STRIP_MID - 0.5} width={VW} height="1"   fill="rgba(0,0,0,0.12)" />
        <rect x="0" y={STRIP_MID + 0.5} width={VW} height="0.5" fill="rgba(255,255,255,0.18)" />

        {/* Bottom bevel: highlight + cast shadow */}
        <rect x="0" y={STRIP_BOT - 2}  width={VW} height="1.5" fill="rgba(255,255,255,0.38)" />
        <rect x="0" y={STRIP_BOT}      width={VW} height="2"   fill="rgba(0,0,0,0.18)" />

        {/* ── 3. Metallic rims around each hole ── */}
        {xs.map((cx, i) => (
          <ellipse key={`rim-${i}`}
            cx={cx} cy={STRIP_MID}
            rx={RX + 0.8} ry={RY - 2.5}
            fill="none"
            stroke="url(#sc-rim)"
            strokeWidth="1.2"
          />
        ))}

        {/* ── 4. Deep punched holes ── */}
        {xs.map((cx, i) => (
          <ellipse key={`hole-${i}`}
            cx={cx} cy={STRIP_MID}
            rx={RX - 0.8} ry={RY - 3.5}
            fill="url(#sc-hole)"
          />
        ))}

        {/* ── 5. Back arc of wire ring (behind page, low opacity) ── */}
        {xs.map((cx, i) => (
          <ellipse key={`back-${i}`}
            cx={cx} cy={STRIP_MID}
            rx={RX} ry={RY}
            fill="none"
            stroke="#4a6070"
            strokeWidth={WIRE - 0.6}
            opacity={0.5}
          />
        ))}

        {/*
         * ── Mask: cover lower half of rings ──
         * Two-rect repaint: first covers with bg colour, then repaints the
         * lower strip segment to restore channel appearance.
         */}
        <rect x="0" y={STRIP_MID} width={VW} height={VH - STRIP_MID}
          fill="url(#sc-bg)" />
        <rect x="0" y={STRIP_MID} width={VW} height={STRIP_BOT - STRIP_MID}
          fill="url(#sc-strip)" opacity="0.95" />
        {/* Restore bottom bevels after mask */}
        <rect x="0" y={STRIP_BOT - 2}  width={VW} height="1.5" fill="rgba(255,255,255,0.38)" />
        <rect x="0" y={STRIP_BOT}      width={VW} height="2"   fill="rgba(0,0,0,0.18)" />

        {/*
         * ── 6 / 7 / 8. Front arc — 3-layer tubular wire effect ──
         *
         * Layer A (shadow):    wide dark stroke  → underside / dark flank of cylinder
         * Layer B (main):      mid-tone gradient → primary lit surface
         * Layer C (specular):  thin bright arc   → top-lit highlight on round wire
         *
         * Each loop is wrapped in a <g filter="..."> for the drop-shadow.
         */}
        {xs.map((cx, i) => (
          <g key={`front-${i}`} filter="url(#sc-loop-shadow)">
            {/* Layer A: shadow / dark underside of cylindrical wire */}
            <path
              d={topArc(cx)}
              fill="none"
              stroke="url(#sc-wire-shadow)"
              strokeWidth={WIRE + 3}
              strokeLinecap="round"
            />
            {/* Layer B: main wire surface */}
            <path
              d={topArc(cx)}
              fill="none"
              stroke="url(#sc-wire)"
              strokeWidth={WIRE}
              strokeLinecap="round"
            />
            {/* Layer C: specular highlight — slightly inside the arc, very thin */}
            <path
              d={topArc(cx, RX - 1.5, RY - 3, 0)}
              fill="none"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
