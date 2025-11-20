// src/features/schedule/types/index.ts

export * from "./scheduleSettings";
export * from "./index";

// Type for appointment types (linked to views in schedule)
export interface AppointmentTypeDef {
  name: string;
  default_duration: number;
  color_code: string;
}

// Appointment status definitions (aligned with backend)
export const STATUS_DEFS = [
  { key: "pending", label: "Pending", color: "#6b7280" },
  { key: "arrived", label: "Arrived", color: "#22c55e" },
  { key: "in_room", label: "In Room", color: "#3b82f6" },
  { key: "in_lobby", label: "In Lobby", color: "#0ea5e9" },
  { key: "seen", label: "Seen", color: "#16a34a" },
  { key: "no_show", label: "No Show", color: "#f97316" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
  { key: "tentative", label: "Tentative", color: "#a855f7" },
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
