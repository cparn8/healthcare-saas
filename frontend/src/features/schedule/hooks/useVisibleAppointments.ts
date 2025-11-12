import { useMemo } from "react";
import { parseLocalDate } from "../../../utils/dateUtils";
import { Appointment } from "../services/appointmentsApi";

interface Options {
  allAppointments: Appointment[];
  visibleStart: Date;
  visibleEnd: Date;
}

/**
 * Returns only the appointments that fall within the visible date range.
 * This version is side-effect-free and memoized by inputs,
 * so it cannot infinite-loop or over-expand.
 */
export function useVisibleAppointments({
  allAppointments,
  visibleStart,
  visibleEnd,
}: Options): Appointment[] {
  return useMemo(() => {
    const inRange = (d: Date) => d >= visibleStart && d <= visibleEnd;

    // Filter strictly to visible window
    const windowed = allAppointments.filter((a) => {
      if (!a.date) return false;
      const d = parseLocalDate(a.date);
      return inRange(d);
    });

    // Deduplicate by (provider, date, start, end)
    const unique = new Map<string, Appointment>();
    for (const a of windowed) {
      const key = `${a.provider}-${a.date}-${a.start_time}-${a.end_time}`;
      if (!unique.has(key)) unique.set(key, a);
    }

    // Sort for consistent rendering
    return Array.from(unique.values()).sort((a, b) => {
      const da = parseLocalDate(a.date).getTime();
      const db = parseLocalDate(b.date).getTime();
      if (da !== db) return da - db;
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    });
  }, [allAppointments, visibleStart, visibleEnd]);
}
