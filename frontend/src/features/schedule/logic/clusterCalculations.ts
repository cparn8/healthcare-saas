// src/features/schedule/logic/clusterCalculations.ts

import { PositionedAppointment } from "./";

/**
 * Build clusters of overlapping appointments.
 *
 * Example:
 *   Input: positioned appointments sorted by startMinutes
 *   Output: array of overlapping groups (clusters)
 */
export function buildClusters(
  appts: PositionedAppointment[]
): PositionedAppointment[][] {
  const clusters: PositionedAppointment[][] = [];
  let current: PositionedAppointment[] = [];
  let clusterEnd = -1;

  for (const appt of appts) {
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

  return clusters;
}
