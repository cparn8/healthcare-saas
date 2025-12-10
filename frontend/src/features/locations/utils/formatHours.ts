// frontend/src/features/locations/utils/formatHours.ts
import { LocationHoursDTO } from "../services/locationApi";

// For sorting correctly:
const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY_LABEL: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

interface GroupedRange {
  days: string[]; // ["mon", "tue", "wed"]
  open: boolean;
  start?: string;
  end?: string;
}

export function formatLocationHours(hours: LocationHoursDTO[]): string[] {
  if (!hours || hours.length === 0) return [];

  // 1. Sort by correct weekday order
  const sorted = [...hours].sort(
    (a, b) => WEEK_ORDER.indexOf(a.weekday) - WEEK_ORDER.indexOf(b.weekday)
  );

  // 2. Build grouped sequences
  const groups: GroupedRange[] = [];
  let current: GroupedRange | null = null;

  for (const h of sorted) {
    const sameAsCurrent =
      current &&
      current.open === h.open &&
      (!h.open || (current.start === h.start && current.end === h.end));

    if (!current || !sameAsCurrent) {
      // Start new group
      current = {
        days: [h.weekday],
        open: h.open,
        start: h.start,
        end: h.end,
      };
      groups.push(current);
    } else {
      // Extend existing group
      current.days.push(h.weekday);
    }
  }

  // 3. Convert groups into readable strings
  return groups.map((g) => {
    const dayRange =
      g.days.length === 1
        ? WEEKDAY_LABEL[g.days[0]]
        : `${WEEKDAY_LABEL[g.days[0]]}–${
            WEEKDAY_LABEL[g.days[g.days.length - 1]]
          }`;

    if (!g.open) return `${dayRange}: Closed`;

    // Convert 24hr → 12hr for nicer formatting
    const start12 = to12Hour(g.start!);
    const end12 = to12Hour(g.end!);

    return `${dayRange}: ${start12} – ${end12}`;
  });
}

// Convert "14:30" → "2:30 PM"
function to12Hour(time: string): string {
  const [h, m] = time.split(":");
  let hour = parseInt(h);
  const meridiem = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${m} ${meridiem}`;
}
