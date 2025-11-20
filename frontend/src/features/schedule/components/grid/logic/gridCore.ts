// src/features/schedule/logic/gridCore.ts

import { PositionedAppointment } from "../../../logic";

export const SLOT_ROW_PX = 48;
export const SLIVER_PERCENT = 12;

/**
 * Create time slots (HH:MM) for a day, based on business hours and slot size.
 */
export function buildSlots(
  openHour: number,
  closeHour: number,
  slotMinutes: number
): string[] {
  const out: string[] = [];
  for (let h = openHour; h < closeHour; h++) {
    for (let m = 0; m < 60; m += slotMinutes) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

/**
 * Minutes since midnight → pixel offset.
 */
export function minutesToPx(
  minutes: number,
  openHour: number,
  slotMinutes: number
): number {
  const minuteHeight = SLOT_ROW_PX / slotMinutes;
  return (minutes - openHour * 60) * minuteHeight;
}

/**
 * Convert a positioned appointment cluster into draw-ready UI boxes.
 */
export function computeClusterBoxes(
  cluster: PositionedAppointment[],
  openHour: number,
  slotMinutes: number
): {
  n: number;
  boxes: {
    appt: PositionedAppointment;
    top: number;
    height: number;
    leftPercent: number;
    widthPercent: number;
  }[];
  collapsedBox?: {
    n: number;
    top: number;
    height: number;
  };
} {
  const n = cluster.length;
  const usable = 100 - SLIVER_PERCENT;

  // Collapsed cluster when there are more than 3 overlapping
  if (n > 3) {
    const clusterStart = Math.min(...cluster.map((a) => a.startMinutes));
    const clusterEnd = Math.max(...cluster.map((a) => a.endMinutes));

    const top = minutesToPx(clusterStart, openHour, slotMinutes);
    const height = (clusterEnd - clusterStart) * (SLOT_ROW_PX / slotMinutes);

    return {
      n,
      boxes: [],
      collapsedBox: {
        n,
        top,
        height,
      },
    };
  }

  const widthPercent = n > 0 ? usable / n : usable;

  const boxes = cluster.map((appt, index) => {
    const top = minutesToPx(appt.startMinutes, openHour, slotMinutes);
    const height =
      (appt.endMinutes - appt.startMinutes) * (SLOT_ROW_PX / slotMinutes);
    const leftPercent = index * widthPercent;

    return {
      appt,
      top,
      height,
      leftPercent,
      widthPercent,
    };
  });

  return { n, boxes };
}

/**
 * Compute overlay sizes for closed hours above and below business hours.
 */
export function computeClosedOverlays(
  openHour: number,
  closeHour: number,
  slotMinutes: number
): {
  topOverlayHeightPx: number;
  bottomOverlayTopPx: number | null;
} {
  const topOverlayHeightPx =
    openHour > 8 ? (openHour - 8) * (60 / slotMinutes) * SLOT_ROW_PX : 0;

  const bottomOverlayTopPx =
    closeHour < 17 ? (closeHour - 8) * (60 / slotMinutes) * SLOT_ROW_PX : null;

  return { topOverlayHeightPx, bottomOverlayTopPx };
}
