"use client";
/**
 * @file useNotes.ts
 * Hook for reading and persisting calendar notes in `localStorage`.
 *
 * Notes are keyed by a context string (`noteKey`) that encodes whether the
 * note belongs to a single day, a date range, or an entire month. This lets
 * the same storage object hold all three categories without collision.
 */

import { useState, useEffect, useCallback } from "react";
import type { NotesStore } from "@/types/calendar";

/** `localStorage` key under which all calendar notes are stored as JSON. */
const STORAGE_KEY = "tuf-wall-calendar-notes";

/**
 * Manages note text for a given calendar context (`noteKey`).
 *
 * ### Behaviour
 * - Hydrates from `localStorage` once on mount; subsequent navigations read
 *   from in-memory state to avoid repeated JSON parses.
 * - The textarea value (`noteText`) is synchronised whenever `noteKey` changes.
 * - Saving an empty note removes the key from storage (avoids accumulating blanks).
 * - The `saved` flag flips `true` for 1.8 s after a successful save, allowing
 *   the UI to show a transient "✓ Saved!" confirmation without a separate toast.
 *
 * @param noteKey - Identifies the note scope. Examples:
 *   - `"Jan 5"` for a single selected day
 *   - `"Jan 5 – Jan 10"` for a selected range
 *   - `"January 2025"` for the whole month
 *
 * @returns
 * - `noteText` / `setNoteText` — controlled textarea value.
 * - `saveNote` — persists the current text (or removes the key if blank).
 * - `saved` — transient flag for showing a save confirmation.
 * - `savedCount` — total number of non-empty notes across all keys.
 */
export function useNotes(noteKey: string) {
  const [store,    setStore]    = useState<NotesStore>({});
  const [noteText, setNoteText] = useState("");
  const [saved,    setSaved]    = useState(false);

  // ── Hydrate from localStorage (runs once on mount) ────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStore(JSON.parse(raw) as NotesStore);
    } catch {
      // Silently ignore JSON parse errors and private-browsing restrictions.
    }
  }, []);

  // ── Sync textarea when the active note key changes ────────────────────────
  useEffect(() => {
    setNoteText(store[noteKey] ?? "");
    setSaved(false);
  }, [noteKey, store]);

  // ── Persist note to localStorage ──────────────────────────────────────────
  /**
   * Saves the current `noteText` under `noteKey`.
   * Removes the key from storage when the text is blank to avoid stale entries.
   * Shows a transient "saved" confirmation for 1.8 seconds.
   */
  const saveNote = useCallback(() => {
    const updated = { ...store };

    if (noteText.trim()) {
      updated[noteKey] = noteText;
    } else {
      // Empty note — remove the entry rather than storing a blank string.
      delete updated[noteKey];
    }

    setStore(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silently handle storage quota exceeded or private-browsing restrictions.
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, [store, noteKey, noteText]);

  /** Number of notes that have been saved (non-empty values across all keys). */
  const savedCount = Object.values(store).filter(Boolean).length;

  return { noteText, setNoteText, saveNote, saved, savedCount };
}
