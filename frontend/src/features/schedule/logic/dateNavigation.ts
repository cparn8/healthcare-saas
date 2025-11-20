// frontend/src/features/schedule/logic/dateNavigation.ts

import { addDays } from "date-fns";
import { ScheduleSettings, Weekday } from "../types";
import {
  DAY_INDEX_TO_KEY,
  parseLocalDate,
  formatYMDLocal,
} from "../../../utils";

/**
 * Normalize any date to the Monday of its week (week starting Monday).
 */
export function normalizeToWeekStart(date: Date): Date {
  const d = parseLocalDate(formatYMDLocal(date));
  const diff = (d.getDay() + 6) % 7; // make Monday = 0
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Move forward/backward to the next "open" day for a given office,
 * according to scheduleSettings.business_hours.
 *
 * Rules:
 * - If no settings or no office → stay on current
 * - If hours not defined for that weekday → treat as open
 * - If hours exist and open === true → open
 * - If hours exist and open === false → closed
 */
export function findNextOpenDay(
  current: Date,
  direction: 1 | -1,
  scheduleSettings: ScheduleSettings | null,
  office: string
): Date {
  if (!scheduleSettings || !office) return current;

  const maxAttempts = 7;
  let next = parseLocalDate(formatYMDLocal(current));
  const businessHours = scheduleSettings.business_hours || {};

  for (let i = 0; i < maxAttempts; i++) {
    next = addDays(next, direction);

    const weekdayKey = DAY_INDEX_TO_KEY[next.getDay()] as Weekday;
    const officeHours = businessHours[office]?.[weekdayKey];

    // If hours undefined OR explicitly open → treat as open
    if (!officeHours || officeHours.open) {
      return next;
    }
  }

  // Fallback: no better day found, stay where we are
  return current;
}
