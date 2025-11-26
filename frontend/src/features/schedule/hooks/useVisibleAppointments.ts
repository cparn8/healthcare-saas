import { useMemo } from "react";
import { parseLocalDate } from "../../../utils";
import { Appointment } from "../services";

interface Options {
  allAppointments: Appointment[];
  visibleStart: Date;
  visibleEnd: Date;
}

/**
 * Returns only the appointments that fall within the visible date range.
 * Deduplicates strictly by appointment ID so double-booking still displays properly.
 */
export function useVisibleAppointments({
  allAppointments,
  visibleStart,
  visibleEnd,
}: Options): Appointment[] {
  return useMemo(() => {
    const inRange = (d: Date) => d >= visibleStart && d < visibleEnd;

    // Filter strictly to visible window
    const windowed = allAppointments.filter((a) => {
      if (!a.date) return false;
      const d = parseLocalDate(a.date);
      return inRange(d);
    });

    // Deduplicate ONLY by ID, never by time range.
    const seenIds = new Set<number>();
    const deduped: Appointment[] = [];

    for (const appt of windowed) {
      if (typeof appt.id === "number") {
        if (!seenIds.has(appt.id)) {
          seenIds.add(appt.id);
          deduped.push(appt);
        }
      } else {
        // Appointments without IDs (rare) should still be included
        deduped.push(appt);
      }
    }

    // Sort for consistent rendering
    return deduped.sort((a, b) => {
      const da = parseLocalDate(a.date).getTime();
      const db = parseLocalDate(b.date).getTime();
      if (da !== db) return da - db;
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    });
  }, [allAppointments, visibleStart, visibleEnd]);
}
