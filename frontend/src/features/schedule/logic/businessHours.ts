// src/features/schedule/logic/businessHours.ts

import { ScheduleSettings, Weekday, DayHours } from "../types";

/**
 * Convert "HH:MM" → decimal hour.
 */
function parseHour(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
}

/**
 * Convert decimal hour → "HH:MM".
 */
function toHHMM(val: number): string {
  const h = Math.floor(val);
  const m = Math.round((val - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Default fallback hours (used when no settings exist).
 */
export const DEFAULT_DAY_HOURS: DayHours = {
  open: true,
  start: "08:00",
  end: "17:00",
};

/**
 * Returns the merged DayHours for a given weekday across multiple offices.
 */
export function computeDayHours(
  settings: ScheduleSettings | null | undefined,
  offices: string[],
  weekday: Weekday
): DayHours {
  if (!settings?.business_hours) return DEFAULT_DAY_HOURS;

  let anyDefined = false;
  let anyOpen = false;
  let earliestStart = Number.POSITIVE_INFINITY;
  let latestEnd = Number.NEGATIVE_INFINITY;

  for (const office of offices) {
    const hours = settings.business_hours[office]?.[weekday];
    if (!hours) continue;

    anyDefined = true;

    if (hours.open) {
      anyOpen = true;
      const s = parseHour(hours.start);
      const e = parseHour(hours.end);
      if (s < earliestStart) earliestStart = s;
      if (e > latestEnd) latestEnd = e;
    }
  }

  // At least one office is open → return merged earliest opening & latest closing
  if (anyOpen && isFinite(earliestStart) && isFinite(latestEnd)) {
    return {
      open: true,
      start: toHHMM(earliestStart),
      end: toHHMM(latestEnd),
    };
  }

  // Offices defined but all closed → return one office's hours (marked closed)
  if (anyDefined) {
    const baseOffice = offices[0];
    const base = settings.business_hours[baseOffice]?.[weekday];
    return { ...(base || DEFAULT_DAY_HOURS), open: false };
  }

  // No data at all → fallback
  return DEFAULT_DAY_HOURS;
}

/**
 * Given a Date, return the weekday key like "mon", "tue".
 */
export function dateToWeekday(date: Date): Weekday {
  const idx = date.getDay(); // 0 = Sun
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][idx] as Weekday;
}
