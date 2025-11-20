// timeFormatting.ts
// Shared time utilities for Day & Week grids.

export function parseHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function format12Hour(h: number, m: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * Return ONLY the formatted time text.
 * Shading must be computed by the grid logic,
 * not here.
 */
export function formatTimeLabel(h: number, m: number): string {
  return format12Hour(h, m);
}
