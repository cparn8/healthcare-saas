// src/features/schedule/logic/dateMath.ts

import {
  parseLocalDate,
  formatYMDLocal,
  safeDate,
} from "../../../utils";

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

  const sameMonth = localStart.getMonth() === end.getMonth();

  const startFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(localStart);

  const endFmt = new Intl.DateTimeFormat("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startFmt} – ${endFmt}`;
}
