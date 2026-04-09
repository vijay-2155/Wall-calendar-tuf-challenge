# Video Demo Script — Wall Calendar

> Keep the video under 3 minutes. Screen record at 1080p, no need for voiceover if you prefer just clicking through.

---

## 1. Opening (10 sec)

- Open https://wall-calendar-amber.vercel.app in browser
- Let the page load so the viewer sees the **pendulum swing animation** — calendar settling on the nail
- Say: *"This is my wall calendar built for the TakeUForward frontend challenge."*

---

## 2. Desktop Layout (20 sec)

- Point out the overall layout:
  - Wall texture background
  - Phillips-head screw nail at the top
  - Spiral coil binding strip
  - Monthly hero photo
  - Month name + navigation arrows
  - Notes panel on the left, calendar grid on the right
- Say: *"The UI mimics a physical wall calendar — the nail, the binding, the photo, everything is custom-built with SVG and CSS."*

---

## 3. Month Navigation + Page Peel (20 sec)

- Click the **next month arrow** → show the page-peel animation (old photo lifts away)
- Click again once or twice
- Click the **prev month arrow** → peel goes the other way
- Say: *"When you navigate months, the old page visibly peels away — the old photo and title are shown on a layer that animates off, revealing the new month underneath. Each month also has its own accent colour."*

---

## 4. Day Selection (30 sec)

- Click any date → it gets highlighted as the start date
- Hover over other dates → show the live range preview
- Click an end date → range fills in between
- Point out: start dot, end dot, in-range fill, weekend colour
- Say: *"You can select a single day or a date range. The hover gives a live preview of what the range will look like before you confirm."*

---

## 5. Notes Feature (30 sec)

- With a range selected, look at the notes panel — show the context label updating (e.g. "Jan 5 – Jan 10")
- Type something in the textarea
- Click **Save Note** → "✓ Saved!" flash
- Click **Clear selection** → notes panel switches back to the whole-month context
- Click a single day → type a note for that day, save it
- Navigate to a different month and come back → note is still there (localStorage)
- Say: *"Notes are tied to whatever you have selected — a range, a single day, or the whole month. They persist in localStorage so they survive a page refresh."*

---

## 6. Holiday Markers (15 sec)

- Navigate to a month with a holiday (e.g. January → Republic Day on 26th, or August → Independence Day)
- Hover over the dot on the holiday date → name appears
- Say: *"Indian public holidays are marked with a dot. Hovering shows the name."*

---

## 7. Responsive / Mobile (30 sec)

- Open browser DevTools → toggle device toolbar → pick iPhone or similar
- Show: layout stacks vertically — hero photo, then title, then notes panel full-width, then calendar grid
- Tap a date range on mobile to show touch works
- Say: *"On mobile the layout stacks vertically and all interactions work with touch."*

---

## 8. Closing (10 sec)

- Switch back to desktop view
- Say: *"Built with Next.js 16, React 19, Tailwind CSS v4, and TypeScript. No external calendar libraries — all date logic and animations are written from scratch."*
- Show the GitHub repo URL or README briefly

---

## What to highlight if asked in interview

- Page-peel: new month renders behind the overlay instantly; the overlay (with old content) animates off using `clip-path: inset()`
- Range picker: three states — no selection, picking (waiting for end date), confirmed range
- Notes key: changes dynamically based on selection — range label, single date, or "Month Year"
- Accent colour: one CSS variable on `:root` updated on every navigation — no prop drilling
