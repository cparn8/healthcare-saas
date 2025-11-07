// /features/schedule/types/scheduleSettings.ts

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DayHours {
  open: boolean;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

/**
 * A mapping of weekdays to their hours.
 * Example: { mon: { open: true, start: "08:00", end: "17:00" }, ... }
 */
export type BusinessHours = Record<Weekday, DayHours>;

/**
 * A mapping of locations (north, south, etc.) to their daily BusinessHours.
 * Example: { north: { mon: {...}, ... }, south: { mon: {...}, ... } }
 */
export interface LocationKeyedHours {
  [location: string]: BusinessHours;
}

/**
 * A single appointment type definition.
 */
export interface AppointmentTypeDef {
  id?: number;
  name: string;
  default_duration: 15 | 30 | 60;
  color_code: string;
}

/**
 * Root schedule settings structure.
 */
export interface ScheduleSettings {
  business_hours: LocationKeyedHours;
  appointment_types: AppointmentTypeDef[];
}
