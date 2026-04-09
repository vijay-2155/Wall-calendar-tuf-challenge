"use client";
/**
 * @file useNotes.ts
 * Hook for reading and auto-persisting calendar notes in `localStorage`.
 *
 * Notes are keyed by a context string (`noteKey`) that encodes whether the
 * note belongs to a single day, a date range, or an entire month.
 */

import { useState, useEffect } from "react";
import type { NotesStore } from "@/types/calendar";

/** `localStorage` key under which all calendar notes are stored as JSON. */
const STORAGE_KEY = "tuf-wall-calendar-notes";

/**
 * Manages note text for a given calendar context (`noteKey`).
 *
 * ### Behaviour
 * - Hydrates from `localStorage` once on mount.
 * - Syncs the textarea value whenever `noteKey` changes.
 * - Auto-saves 600 ms after the user stops typing — no explicit save button needed.
 * - Saving an empty note removes the key from storage.
 * - `autoSaved` flips `true` for 1.5 s after each auto-save to show a transient "✓" indicator.
 *
 * @param noteKey - Identifies the note scope (e.g. `"Apr 8"`, `"Apr 5 – Apr 10"`, `"April 2026"`).
 * @returns `noteText` / `setNoteText` — controlled textarea value.
 *          `autoSaved` — transient flag for showing a save confirmation.
 *          `store` — the full notes map (used by parent to derive month plans).
 */
export function useNotes(noteKey: string) {
  const [store,     setStore]     = useState<NotesStore>({});
  const [noteText,  setNoteText]  = useState("");
  const [autoSaved, setAutoSaved] = useState(false);

  // ── Hydrate from localStorage (runs once on mount) ─────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStore(JSON.parse(raw) as NotesStore);
    } catch {
      // Silently ignore JSON parse errors and private-browsing restrictions.
    }
  }, []);

  // ── Sync textarea when the active note key or store changes ────────────────
  useEffect(() => {
    setNoteText(store[noteKey] ?? "");
    setAutoSaved(false);
  }, [noteKey, store]);

  // ── Auto-save with 600 ms debounce ─────────────────────────────────────────
  /**
   * Fires 600 ms after the last keystroke. Saves `noteText` under `noteKey`,
   * or removes the key if the text is blank.
   */
  useEffect(() => {
    // Skip if nothing has changed since the last save.
    if (noteText === (store[noteKey] ?? "")) return;

    const timer = setTimeout(() => {
      const updated = { ...store };
      // Strip HTML tags before checking for emptiness so a lone <br> doesn't get saved.
      const plainText = noteText.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
      if (plainText) {
        updated[noteKey] = noteText;
      } else {
        delete updated[noteKey];
      }
      setStore(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Silently handle storage quota or private-browsing restrictions.
      }
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    }, 600);

    return () => clearTimeout(timer);
  }, [noteText, noteKey, store]);

  /** Deletes the note stored under `key` from localStorage and in-memory store. */
  const deleteNote = (key: string) => {
    const updated = { ...store };
    delete updated[key];
    setStore(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  return { noteText, setNoteText, autoSaved, store, deleteNote };
}
