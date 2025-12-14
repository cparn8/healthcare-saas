// src/features/schedule/types/index.ts

export * from "./scheduleSettings";

// Type for appointment types (linked to views in schedule)
export interface AppointmentTypeDef {
  name: string;
  default_duration: number;
  color_code: string;
}

// Appointment status definitions (aligned with backend)
export const STATUS_DEFS = [
  { key: "pending", label: "Pending" },
  { key: "arrived", label: "Arrived" },
  { key: "in_room", label: "In Room" },
  { key: "in_lobby", label: "In Lobby" },
  { key: "seen", label: "Seen" },
  { key: "no_show", label: "No Show" },
  { key: "cancelled", label: "Cancelled" },
  { key: "tentative", label: "Tentative" },
] as const;

export type AppointmentStatus = (typeof STATUS_DEFS)[number]["key"];

// Schedule filter structure
export interface ScheduleFilters {
  providers: number[]; // multiple providers
  types: string[]; // appointment types
  statuses: AppointmentStatus[]; // appointment statuses
  defaultView: "appointments" | "day" | "week";
  includeBlockedTimes: boolean;
  offices: string[];
}
