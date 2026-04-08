/**
 * @file holidays.ts
 * Indian public holiday data used to mark and label calendar dates.
 *
 * Key format: `"month-day"` — 1-indexed month, no leading zeros.
 * This matches the lookup key built in `buildCells()` (e.g. `"8-15"` = 15 August).
 *
 * Note: Dates for moveable feasts (Holi, Diwali, Eid, etc.) shift each year.
 * The values here reflect approximate 2025 dates and should be updated annually.
 */
export const HOLIDAYS: Record<string, string> = {
  "1-1":   "New Year's Day",
  "1-14":  "Pongal / Makar Sankranti",
  "1-26":  "Republic Day",
  "3-17":  "Holi",
  "4-14":  "Dr. Ambedkar Jayanti",
  "4-18":  "Good Friday",
  "5-1":   "Labour Day",
  "8-15":  "Independence Day",
  "10-2":  "Gandhi Jayanti",
  "10-20": "Dussehra",
  "11-5":  "Diwali",
  "11-15": "Guru Nanak Jayanti",
  "12-25": "Christmas Day",
};
