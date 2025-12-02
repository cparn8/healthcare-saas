// src/features/schedule/logic/dateMath.ts

import { parseLocalDate, formatYMDLocal, safeDate } from "../../../utils";
import { addDays } from "date-fns";

/**
 * Given any date string (YYYY-MM-DD) or Date,
 * returns a readable Mon–Fri week range (local-safe).
 *
 * This is extracted from SchedulePage so it can be reused by other
 * schedule-related views or exports.
 */
export function formatWeekRange(input: string | Date): string {
  const start =
    typeof input === "string"
      ? parseLocalDate(input)
      : parseLocalDate(input.toISOString().split("T")[0]);

  // Normalize to local midnight
  const localStart = safeDate(formatYMDLocal(start));

  // Find Monday of that week (assuming Sunday = 0)
  const diff = (localStart.getDay() + 6) % 7;
  localStart.setDate(localStart.getDate() - diff);

  const end = safeDate(formatYMDLocal(localStart));
  end.setDate(localStart.getDate() + 4); // Mon → Fri

  const startFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(localStart);

  const endFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startFmt} – ${endFmt}`;
}

export function computeOpenRangeForWeek(
  weekStart: Date,
  isDayOpen: (day: Date) => boolean
) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const openDays = days.filter(isDayOpen);

  if (openDays.length === 0) return null;

  return {
    first: openDays[0],
    last: openDays[openDays.length - 1],
  };
}
