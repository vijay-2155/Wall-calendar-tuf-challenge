"use client";
import { useRef, useState, useEffect } from "react";
/**
 * @file NotesPanel.tsx
 * Two-mode sidebar:
 *  1. Plans list — all notes for this month (no selection).
 *  2. Edit mode — contenteditable rich-text editor for the selected date/range.
 *
 * Uses document.execCommand for bold/italic so text renders visually styled
 * without any markdown syntax appearing in the editor.
 */

interface MonthPlan { key: string; day: number; endDay?: number; text: string; }

interface NotesPanelProps {
  noteKey:       string;
  noteText:      string;
  setNoteText:   (v: string) => void;
  autoSaved:     boolean;
  onSave:        (currentHtml: string) => void;
  monthPlans:    MonthPlan[];
  onPlanClick:   (day: number, endDay?: number) => void;
  onDeletePlan:  (key: string) => void;
  picking:       boolean;
  hasSelection:  boolean;
  onClear?:      () => void;
}

const EMOJIS = [
  "🎂","🎉","🏥","💊","✈️","🚗",
  "🏠","📞","💰","🎓","❤️","🙏",
  "⭐","🎁","📅","🕐","🍽️","💼",
  "🏋️","🎯","👨‍👩‍👧","🌸","🙌","📝",
];

export function NotesPanel({
  noteKey, noteText, setNoteText,
  autoSaved, onSave, monthPlans, onPlanClick, onDeletePlan,
  picking, hasSelection, onClear,
}: NotesPanelProps) {

  // ── All hooks at the top — Rules of Hooks requires no conditional calls ────
  const editorRef  = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  /**
   * Sync the editor's innerHTML when the note key changes or when the store
   * hydrates. Skips the update while the user is actively typing (editor focused)
   * to avoid resetting the cursor position.
   */
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = noteText;
    }
  }, [noteText, noteKey]);

  const handleInput = () => setNoteText(editorRef.current?.innerHTML ?? "");

  const applyFormat = (command: "bold" | "italic") => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    setNoteText(editorRef.current?.innerHTML ?? "");
  };

  const insertBullet = () => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, "• ");
    setNoteText(editorRef.current?.innerHTML ?? "");
  };

  const insertEmoji = (emoji: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, emoji);
    setNoteText(editorRef.current?.innerHTML ?? "");
    setShowEmoji(false);
  };

  const toolbarBtn = "w-7 h-7 flex items-center justify-center rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-lines)] transition-colors cursor-pointer";

  // ── Plans list ─────────────────────────────────────────────────────────────
  if (!hasSelection) {
    return (
      <aside
        className="flex flex-col gap-2 p-3 bg-[var(--color-paper)] border-r border-[var(--color-border)] w-[160px] min-w-[140px] max-sm:w-full max-sm:border-r-0 max-sm:border-b"
        aria-label="Month plans"
      >
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--color-blue)]">
          This Month
        </p>

        {monthPlans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 pb-4">
            <span className="text-2xl">📝</span>
            <p className="text-[10px] text-[#bbb] text-center leading-snug">
              Click a date to<br />write a note
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
            {monthPlans.map(({ key, day, endDay, text }) => (
              <div
                key={key}
                className="rounded-sm overflow-hidden group"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
              >
                {/* Accent header row: date label + delete button */}
                <div
                  className="flex items-center justify-between px-2 py-[3px]"
                  style={{ background: "var(--color-blue)" }}
                >
                  <p className="text-[9px] font-bold text-white tracking-wide">{key}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePlan(key); }}
                    title="Delete note"
                    className="w-4 h-4 flex items-center justify-center rounded-full text-white opacity-60 hover:opacity-100 hover:bg-white/20 transition-all cursor-pointer"
                    aria-label={`Delete note for ${key}`}
                  >
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-2.5 h-2.5">
                      <line x1="2" y1="2" x2="10" y2="10" />
                      <line x1="10" y1="2" x2="2" y2="10" />
                    </svg>
                  </button>
                </div>

                {/* Note body — click to open for editing */}
                <button
                  onClick={() => onPlanClick(day, endDay)}
                  className="w-full text-left bg-[#fffbee] border-l-[3px] border-[var(--color-blue)] pl-2 pr-1 py-1.5 cursor-pointer hover:bg-[#fff8e0] transition-colors"
                  aria-label={`Edit note for ${key}`}
                >
                  <p
                    className="text-[10px] text-[#555] leading-snug line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <aside
      className="flex flex-col gap-2 p-3 bg-[var(--color-paper)] border-r border-[var(--color-border)] w-[160px] min-w-[140px] max-sm:w-full max-sm:border-r-0 max-sm:border-b"
      aria-label="Notes panel"
    >
      <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--color-blue)]">
        Notes
      </p>

      <p className="text-[10px] text-[#999] leading-snug min-h-[14px]">{noteKey}</p>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-1">
        {/* Bold */}
        <button
          title="Bold"
          className={toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); applyFormat("bold"); }}
        >
          <strong className="text-[12px] text-[#444]">B</strong>
        </button>

        {/* Italic */}
        <button
          title="Italic"
          className={toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); applyFormat("italic"); }}
        >
          <em className="text-[12px] text-[#444]">I</em>
        </button>

        {/* Bullet */}
        <button
          title="Bullet point"
          className={toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); insertBullet(); }}
        >
          <span className="text-[14px] text-[#444] leading-none">•</span>
        </button>

        {/* Emoji picker */}
        <div className="relative ml-auto">
          <button
            title="Insert emoji"
            className={toolbarBtn}
            onMouseDown={(e) => { e.preventDefault(); setShowEmoji((v) => !v); }}
          >
            <span className="text-[14px] leading-none">😊</span>
          </button>

          {showEmoji && (
            <div
              className="absolute bottom-full right-0 mb-1 bg-white border border-[var(--color-border)] rounded-md p-1.5 grid grid-cols-6 gap-0.5 z-50"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)", width: "172px" }}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  title={emoji}
                  className="w-6 h-6 flex items-center justify-center rounded text-[13px] hover:bg-[var(--color-lines)] cursor-pointer transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); insertEmoji(emoji); }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rich-text editor (contenteditable) */}
      <div className="relative flex-1 min-h-[110px] bg-white rounded-sm border border-[var(--color-border)] overflow-hidden paper-lines">
        {/* Placeholder — shown when editor is empty */}
        {!noteText && (
          <p className="absolute top-2 left-2 text-[11px] text-[#bbb] pointer-events-none z-0 select-none">
            Write here...
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          aria-label="Note editor"
          className="relative z-10 w-full h-full min-h-[120px] p-2 outline-none text-[12px] text-[#333] leading-6 font-[family-name:var(--font-body)] overflow-y-auto"
        />
      </div>

      {/* Save button — reads innerHTML directly from the editor so stale state never causes a missed save */}
      <button
        onClick={() => onSave(editorRef.current?.innerHTML ?? "")}
        className="w-full py-2 rounded-sm text-white text-[13px] font-semibold tracking-wide cursor-pointer transition-all duration-150 active:scale-[0.97]"
        style={{ background: autoSaved ? "#4caf50" : "var(--color-blue)" }}
      >
        {autoSaved ? "✓ Saved!" : "Save Note"}
      </button>

      {hasSelection && (
        <button
          onClick={onClear}
          className="w-full py-1.5 rounded-sm text-[11px] text-[#888] border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-lines)] transition-colors cursor-pointer"
        >
          ← Back to plans
        </button>
      )}

      {picking && (
        <p className="text-[10px] font-bold text-center text-[var(--color-blue)] animate-pulse-hint">
          ← tap end date
        </p>
      )}
    </aside>
  );
}
