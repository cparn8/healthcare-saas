// utils/weekdays.ts
export const WEEKDAY_ORDER = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
export type WeekdayLabel = (typeof WEEKDAY_ORDER)[number];

// JS-compatible mapping (Sunday = 0)
export const DAY_MAP: Record<WeekdayLabel, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// lowercase aliases if needed
export const DAY_MAP_LOWER: Record<string, number> = Object.fromEntries(
  WEEKDAY_ORDER.map((d, i) => [d.toLowerCase(), i])
);
