// src/features/schedule/hooks/useBusinessHoursFilter.ts
import { useMemo, useCallback } from "react";
import { ScheduleSettings, Weekday, DayHours } from "../types";
import { DAY_INDEX_TO_KEY } from "../../../utils";

export function useBusinessHoursFilter(
  scheduleSettings: ScheduleSettings | null | undefined,
  offices: string[]
) {
  const defaultHours = useMemo<DayHours>(
    () => ({ open: true, start: "08:00", end: "17:00" }),
    []
  );

  const officeKeys = useMemo(() => {
    if (offices && offices.length > 0) return offices;

    const allKeys = Object.keys(scheduleSettings?.business_hours || {});
    return allKeys.length > 0 ? allKeys : ["north"];
  }, [offices, scheduleSettings]);

  const parseHour = useCallback((hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  }, []);

  const toHHMM = useCallback((val: number): string => {
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, []);

  const getDayHours = useCallback(
    (weekday: Weekday): DayHours => {
      if (!scheduleSettings?.business_hours) return defaultHours;

      let anyDefined = false;
      let anyOpen = false;
      let earliestStart = Number.POSITIVE_INFINITY;
      let latestEnd = Number.NEGATIVE_INFINITY;

      for (const key of officeKeys) {
        const hours = scheduleSettings.business_hours[key]?.[weekday];
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

      if (anyOpen && isFinite(earliestStart) && isFinite(latestEnd)) {
        return {
          open: true,
          start: toHHMM(earliestStart),
          end: toHHMM(latestEnd),
        };
      }

      if (anyDefined) {
        const first = officeKeys[0];
        const base =
          scheduleSettings.business_hours[first]?.[weekday] || defaultHours;
        return { ...base, open: false };
      }

      return defaultHours;
    },
    [
      scheduleSettings,
      officeKeys,
      parseHour,
      toHHMM,
      defaultHours, // ← THIS removes your warning
    ]
  );

  const isDayOpen = useCallback(
    (date: Date) => {
      const weekday = DAY_INDEX_TO_KEY[date.getDay()] as Weekday;
      return getDayHours(weekday).open;
    },
    [getDayHours]
  );

  const getOpenRange = useCallback(
    (date: Date) => {
      const weekday = DAY_INDEX_TO_KEY[date.getDay()] as Weekday;
      const hours = getDayHours(weekday);
      return {
        start: parseHour(hours.start),
        end: parseHour(hours.end),
      };
    },
    [getDayHours, parseHour]
  );

  const openWeekdays = useMemo(() => {
    const weekKeys: Weekday[] = [
      "sun",
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
    ];

    return weekKeys.filter((d) => getDayHours(d).open);
  }, [getDayHours]);

  return { getDayHours, isDayOpen, getOpenRange, openWeekdays };
}
