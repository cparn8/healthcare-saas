// weekSlots.ts
// Shared helpers for determining weekly columns & slot counts.

export function computeSlotsPerDay(
  openHour: number,
  closeHour: number,
  slotMinutes: number
): number {
  return ((closeHour - openHour) * 60) / slotMinutes;
}
