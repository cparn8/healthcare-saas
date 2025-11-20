// frontend/src/features/schedule/logic/appointmentStatus.ts
// Centralized status & intake types/options for schedule UI.

export type StatusKey =
  | "pending"
  | "arrived"
  | "in_room"
  | "no_show"
  | "cancelled"
  | "in_lobby"
  | "seen"
  | "tentative"
  | "na"; // frontend-only for Block Time rows

// Status options for normal appointments (non-block-time)
export const STATUS_OPTIONS: {
  key: Exclude<StatusKey, "na">;
  label: string;
  dotClass: string; // Tailwind bg class
}[] = [
  { key: "pending", label: "Pending arrival", dotClass: "bg-green-500" },
  { key: "arrived", label: "Arrived", dotClass: "bg-yellow-200" },
  { key: "in_room", label: "In room", dotClass: "bg-orange-500" },
  { key: "no_show", label: "No show", dotClass: "bg-red-500" },
  { key: "cancelled", label: "Cancelled", dotClass: "bg-red-900" },
  { key: "in_lobby", label: "In lobby", dotClass: "bg-yellow-500" },
  { key: "seen", label: "Seen", dotClass: "bg-gray-300" },
  { key: "tentative", label: "Tentative", dotClass: "bg-gray-600" },
];

// Block-time specific status options
export const BLOCK_STATUS_OPTIONS: {
  key: StatusKey;
  label: string;
  dotClass: string;
}[] = [
  { key: "na", label: "N/A", dotClass: "bg-white" },
  { key: "in_room", label: "In room", dotClass: "bg-orange-500" },
];

// Intake form status
export type IntakeStatus = "not_submitted" | "submitted";

export const INTAKE_OPTIONS: {
  key: IntakeStatus;
  label: string;
  dotClass: string;
}[] = [
  { key: "not_submitted", label: "Not Submitted", dotClass: "bg-orange-500" },
  { key: "submitted", label: "Submitted", dotClass: "bg-green-500" },
];

// Small shared constant for room label length
export const MAX_ROOM_LEN = 6;
