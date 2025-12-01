// src/features/schedule/utils/filterAppointments.ts
import { Appointment } from "../services/appointmentsApi";
import { ScheduleFilters } from "../types";

interface Args {
  appointments: Appointment[];
  filters: ScheduleFilters;
  selectedOffices: string[]; // e.g. ["north", "south"]
}

/**
 * Centralized filtering logic for all schedule views.
 * Handles multi-office logic + all sidebar filters.
 */
export function filterAppointments({
  appointments,
  filters,
  selectedOffices,
}: Args): Appointment[] {
  return appointments.filter((appt) => {
    /* ------------------------------------------------------------------
     * OFFICE FILTER (multi-select, optional)
     * ------------------------------------------------------------------
     *
     * Rules:
     *  - If 0 selected → show all offices
     *  - If 1+ selected → show only those offices
     *  - appt.office must exist
     */
    if (selectedOffices.length > 0) {
      if (!appt.office || !selectedOffices.includes(appt.office)) {
        return false;
      }
    }

    /* ------------------------------------------------------------------
     * PROVIDER FILTER
     * ------------------------------------------------------------------ */
    if (filters.providers.length > 0) {
      const id = appt.provider ?? null;
      if (!id || !filters.providers.includes(id)) return false;
    }

    /* ------------------------------------------------------------------
     * APPOINTMENT TYPE FILTER
     * ------------------------------------------------------------------ */
    const isBlockAppt = appt.is_block === true;

    if (!isBlockAppt && filters.types.length > 0) {
      if (
        !appt.appointment_type ||
        !filters.types.includes(appt.appointment_type)
      ) {
        return false;
      }
    }

    /* ------------------------------------------------------------------
     * STATUS FILTER
     * ------------------------------------------------------------------ */
    if (!isBlockAppt && filters.statuses.length > 0) {
      if (!appt.status || !filters.statuses.includes(appt.status as any)) {
        return false;
      }
    }

    /* ------------------------------------------------------------------
     * BLOCK TIME VISIBILITY
     * ------------------------------------------------------------------ */
    if (!filters.includeBlockedTimes) {
      if (appt.is_block || appt.appointment_type === "Block Time") {
        return false;
      }
    }

    return true;
  });
}
