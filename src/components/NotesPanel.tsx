"use client";
/**
 * @file NotesPanel.tsx
 * Sidebar panel for writing and saving notes against a calendar context.
 *
 * The "context" (shown above the textarea) dynamically reflects what the user
 * has selected:
 *   - A date range → "Jan 5 – Jan 10"
 *   - A single day → "Jan 5"
 *   - Nothing      → "January 2025" (whole month)
 *
 * This component is purely presentational — all state lives in `useNotes` and
 * `useCalendarState`, passed in as props.
 */

/** Props accepted by {@link NotesPanel}. */
interface NotesPanelProps {
  /** Identifies which note to display / save. Derived from the current selection. */
  noteKey: string;
  /** Current value of the textarea (controlled). */
  noteText: string;
  /** Updates `noteText` as the user types. */
  setNoteText: (v: string) => void;
  /** Persists `noteText` to localStorage under `noteKey`. */
  onSave: () => void;
  /** `true` for ~1.8 s after a successful save; drives the "✓ Saved!" label. */
  saved: boolean;
  /** Total number of non-empty notes saved across all keys. */
  savedCount: number;
  /** `true` while the user is picking a range end date (shows the picking hint). */
  picking: boolean;
  /** `true` when at least a start date has been selected. */
  hasSelection: boolean;
  /** Clears the current date selection. Only shown when `hasSelection` is true. */
  onClear?: () => void;
}

/**
 * Sidebar note editor displayed to the left of the calendar grid.
 *
 * The textarea uses a CSS `paper-lines` background (defined in `globals.css`)
 * to mimic a ruled notepad aesthetic that complements the wall-calendar theme.
 */
export function NotesPanel({
  noteKey, noteText, setNoteText,
  onSave, saved, savedCount,
  picking, hasSelection, onClear,
}: NotesPanelProps) {
  return (
    <aside
      className="flex flex-col gap-2 p-3 bg-[var(--color-paper)] border-r border-[var(--color-border)] w-[160px] min-w-[140px] max-sm:w-full max-sm:border-r-0 max-sm:border-b"
      aria-label="Notes panel"
    >
      {/* Section heading */}
      <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--color-blue)]">
        Notes
      </p>

      {/* Active context label (day / range / month) */}
      <p className="text-[10px] text-[#999] leading-snug min-h-[14px]">
        {noteKey}
      </p>

      {/* Ruled textarea — paper-lines provides the CSS horizontal-line background */}
      <div className="relative flex-1 min-h-[110px] bg-white rounded-sm border border-[var(--color-border)] overflow-hidden paper-lines">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write notes here..."
          rows={8}
          aria-label="Notes text area"
          className="relative z-10 w-full h-full min-h-[120px] p-2 resize-none bg-transparent border-none outline-none text-[12px] text-[#333] leading-6 font-[family-name:var(--font-body)]"
        />
      </div>

      {/* Save button — label toggles to "✓ Saved!" for 1.8 s after saving */}
      <button
        onClick={onSave}
        className="w-full py-2 rounded-sm text-white text-[13px] font-semibold tracking-wide cursor-pointer bg-[var(--color-blue)] hover:bg-[var(--color-blue-dark)] active:scale-[0.97] transition-all duration-150"
      >
        {saved ? "\u2713 Saved!" : "Save Note"}
      </button>

      {/* Clear selection — only visible when a date or range is active */}
      {hasSelection && (
        <button
          onClick={onClear}
          className="w-full py-1.5 rounded-sm text-[11px] text-[#888] border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-lines)] transition-colors cursor-pointer"
        >
          Clear selection
        </button>
      )}

      {/* Picking hint — pulses while awaiting the range end date */}
      {picking && (
        <p className="text-[10px] font-bold text-center text-[var(--color-blue)] animate-pulse-hint">
          &#x2190; tap end date
        </p>
      )}

      {/* Saved note count — shown once at least one note exists */}
      {savedCount > 0 && (
        <p className="mt-auto pt-1 text-[9px] text-center text-[#bbb]">
          {savedCount} note{savedCount !== 1 ? "s" : ""} saved
        </p>
      )}
    </aside>
  );
}
