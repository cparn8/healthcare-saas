// src/utils/dateUtils.ts
import { Weekday } from "../features/schedule/types/scheduleSettings";

/** Parse "YYYY-MM-DD" as a *local* date (no UTC drift) */
export function parseLocalDate(ymd: string): Date {
  if (!ymd) return new Date(NaN);
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Safe wrapper to always parse or cast as a local date */
export function safeDate(input: string | Date): Date {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return parseLocalDate(input);
  }
  return new Date(input);
}

/** Format a Date to "YYYY-MM-DD" in *local* time */
export function formatYMDLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a date string to readable "MMM DD, YYYY" */
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return "";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return parseLocalDate(dateString).toLocaleDateString("en-US", options);
}

/** Short date label like "Mon, Nov 10, 2025" */
export function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

// utils/dateUtils.ts
export function isSameLocalDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === "string" ? parseLocalDate(a) : a;
  const db = typeof b === "string" ? parseLocalDate(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Maps JS Date.getDay() (0=Sun) → domain Weekday key */
export const DAY_INDEX_TO_KEY: Record<number, Weekday> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

/** Reverse map Weekday key → JS Date.getDay() index */
export const WEEKDAY_KEY_TO_INDEX: Record<Weekday, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};
