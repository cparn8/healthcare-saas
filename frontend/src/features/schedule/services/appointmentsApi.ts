// frontend/src/features/schedule/services/appointmentsApi.ts
import API from "../../../services/api";

/**
 * Payload used for creating or updating an appointment.
 * (Form submissions, POST/PUT requests)
 */
export interface AppointmentPayload {
  id?: number;
  patient?: number | null;
  provider?: number | null;
  office: string;
  appointment_type: string;
  color_code?: string;
  chief_complaint?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  duration: number; // minutes
  is_recurring: boolean;
  repeat_days?: string[];
  repeat_interval_weeks?: number;
  repeat_end_date?: string | null;
  repeat_occurrences?: number | null;
  send_intake_form?: boolean;
  allow_overlap?: boolean;
  is_block?: boolean; // identifies Block Time entries
}

/**
 * Full appointment record returned by the backend.
 * Includes database-only and derived fields.
 */
export interface Appointment extends AppointmentPayload {
  id: number;
  created_at: string;
  updated_at: string;
  patient_name?: string | null;
  provider_name?: string;
}

/**
 * Appointments API
 */
export const appointmentsApi = {
  // ---- List ----
  async list(params: Record<string, any> = {}) {
    const res = await API.get("/appointments/", { params });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;

    console.warn("⚠️ Unexpected appointmentsApi.list() response:", data);
    return [];
  },

  // ---- Retrieve single ----
  async retrieve(id: number): Promise<Appointment> {
    const res = await API.get(`/appointments/${id}/`);
    return res.data;
  },

  // ---- Create ----
  async create(data: AppointmentPayload): Promise<Appointment> {
    const res = await API.post("/appointments/", data);
    return res.data;
  },

  // ---- Update ----
  async update(id: number, data: AppointmentPayload): Promise<Appointment> {
    const res = await API.put(`/appointments/${id}/`, data);
    return res.data;
  },

  // ---- Delete ----
  async delete(id: number): Promise<void> {
    await API.delete(`/appointments/${id}/`);
  },
};
