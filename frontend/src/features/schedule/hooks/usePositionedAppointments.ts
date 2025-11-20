// src/features/schedule/hooks/usePositionedAppointments.ts
import { useMemo } from "react";
import { Appointment } from "../services";

export interface PositionedAppointment extends Appointment {
  startMinutes: number;
  endMinutes: number;
}

export function usePositionedAppointments(appointments: Appointment[] = []) {
  return useMemo(() => {
    // convert start_time / end_time → minutes since midnight
    const positioned: PositionedAppointment[] = appointments
      .filter((a) => a.start_time && a.end_time)
      .map((a) => {
        const [sh, sm] = (a.start_time ?? "00:00").split(":").map(Number);
        const [eh, em] = (a.end_time ?? "00:00").split(":").map(Number);

        return {
          ...a,
          startMinutes: sh * 60 + sm,
          endMinutes: eh * 60 + em,
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);

    // build overlap clusters
    const clusters: PositionedAppointment[][] = [];
    let current: PositionedAppointment[] = [];
    let clusterEnd = -1;

    for (const appt of positioned) {
      if (!current.length || appt.startMinutes < clusterEnd) {
        current.push(appt);
        clusterEnd = Math.max(clusterEnd, appt.endMinutes);
      } else {
        clusters.push(current);
        current = [appt];
        clusterEnd = appt.endMinutes;
      }
    }

    if (current.length) clusters.push(current);

    return { positioned, clusters };
  }, [appointments]);
}
