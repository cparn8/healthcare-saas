// src/features/schedule/types/appointment.ts
export interface Appointment {
  id: number;
  patient: number | null;
  provider: number;
  office: string;
  appointment_type: string;
  color_code: string;
  chief_complaint?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_recurring: boolean;
  repeat_days?: string[] | null;
  repeat_interval_weeks: number;
  repeat_end_date?: string | null;
  repeat_occurrences?: number | null;
  created_at: string;
  updated_at: string;
  patient_name?: string | null;
  provider_name?: string;
}
