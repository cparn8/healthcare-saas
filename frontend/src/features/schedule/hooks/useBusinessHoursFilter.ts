import { useMemo } from "react";
import { ScheduleSettings, Weekday } from "../types/scheduleSettings";
import { DAY_INDEX_TO_KEY } from "../../../utils/dateUtils";

/**
 * Hook to interpret and safely access scheduleSettings business hours.
 */
export function useBusinessHoursFilter(
  scheduleSettings: ScheduleSettings | null | undefined,
  office: string
) {
  // Default hours in case of missing data
  const defaultHours = { open: true, start: "08:00", end: "17:00" };

  /**
   * Get business hours for a specific weekday.
   */
  const getDayHours = (weekday: Weekday) => {
    const officeHours =
      scheduleSettings?.business_hours?.[office]?.[weekday] ?? defaultHours;
    return officeHours;
  };

  /**
   * Convert "08:00" -> 8, "17:30" -> 17.5
   */
  const parseHour = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  };

  /**
   * Returns whether a given date is an open business day.
   */
  const isDayOpen = (date: Date) => {
    const weekday = DAY_INDEX_TO_KEY[date.getDay()] as Weekday;
    const hours = getDayHours(weekday);
    return !!hours.open;
  };

  /**
   * Returns the start and end hour (as numbers) for a given date.
   */
  const getOpenRange = (date: Date) => {
    const weekday = DAY_INDEX_TO_KEY[date.getDay()] as Weekday;
    const hours = getDayHours(weekday);
    return {
      start: parseHour(hours.start),
      end: parseHour(hours.end),
    };
  };

  /**
   * Optional: Returns a list of open weekdays (for WeekViewGrid).
   */
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
    return weekKeys.filter(
      (d) =>
        scheduleSettings?.business_hours?.[office]?.[d]?.open ??
        defaultHours.open
    );
  }, [scheduleSettings, office, defaultHours.open]);

  return { getDayHours, isDayOpen, getOpenRange, openWeekdays };
}
