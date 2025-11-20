// src/features/schedule/logic/appointmentPositioning.ts

import { Appointment } from "../services";

export interface PositionedAppointment extends Appointment {
  startMinutes: number;
  endMinutes: number;
}

/**
 * Convert HH:MM → minutes since midnight.
 */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Take a list of appointments and attach start/end minute offsets.
 */
export function positionAppointments(
  appointments: Appointment[]
): PositionedAppointment[] {
  return appointments
    .filter((a) => a.start_time && a.end_time)
    .map((a) => ({
      ...a,
      startMinutes: hhmmToMinutes(a.start_time ?? "00:00"),
      endMinutes: hhmmToMinutes(a.end_time ?? "00:00"),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);
}
