// src/features/schedule/hooks/useBusinessHours.ts

import { useMemo, useCallback } from "react";
import { ScheduleSettings, Weekday, DayHours } from "../types";
import { computeDayHours, dateToWeekday } from "../logic";

/**
 * React hook wrapper around pure business-hours logic.
 * Accepts multi-office input and produces:
 *  - isDayOpen(date)
 *  - getOpenRange(date)
 *  - getDayHours(weekday)
 *  - openWeekdays list
 */
export function useBusinessHours(
  scheduleSettings: ScheduleSettings | null | undefined,
  offices: string[]
) {
  const officeKeys = useMemo(() => {
    if (offices && offices.length > 0) return offices;

    const any = Object.keys(scheduleSettings?.business_hours || {});
    return any.length > 0 ? any : ["north"];
  }, [offices, scheduleSettings]);

  const getDayHours = useCallback(
    (weekday: Weekday): DayHours => {
      return computeDayHours(scheduleSettings, officeKeys, weekday);
    },
    [scheduleSettings, officeKeys]
  );

  const isDayOpen = useCallback(
    (date: Date) => {
      const weekday = dateToWeekday(date);
      return getDayHours(weekday).open;
    },
    [getDayHours]
  );

  const getOpenRange = useCallback(
    (date: Date) => {
      const weekday = dateToWeekday(date);
      const hours = getDayHours(weekday);

      const [startH, startM] = hours.start.split(":").map(Number);
      const [endH, endM] = hours.end.split(":").map(Number);

      return {
        start: startH + startM / 60,
        end: endH + endM / 60,
      };
    },
    [getDayHours]
  );

  const openWeekdays = useMemo(() => {
    const keys: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    return keys.filter((d) => getDayHours(d).open);
  }, [getDayHours]);

  return { getDayHours, isDayOpen, getOpenRange, openWeekdays };
}
