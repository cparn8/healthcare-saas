// daySlots.ts
// Builds the list of HH:MM slots for DayViewGrid

export function buildDaySlots(
  openHour: number,
  closeHour: number,
  slotMinutes: number
): string[] {
  const slots: string[] = [];
  const totalMinutes = (closeHour - openHour) * 60;
  const steps = totalMinutes / slotMinutes;

  for (let i = 0; i < steps; i++) {
    const mins = openHour * 60 + i * slotMinutes;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  return slots;
}
