// frontend/src/features/appointments/services/appointmentsApi.ts
import API from "../../../services/api";

export interface AppointmentPayload {
  id?: number;
  patient?: number | null;
  provider: number;
  office: string;
  appointment_type: string;
  color_code?: string;
  chief_complaint?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  duration: number;
  is_recurring: boolean;
  repeat_days?: string[];
  repeat_interval_weeks?: number;
  repeat_end_date?: string | null;
  repeat_occurrences?: number | null;
  send_intake_form?: boolean;
  allow_overlap?: boolean;
}

export const appointmentsApi = {
  async list(params: Record<string, any> = {}) {
    const res = await API.get("/appointments/", { params });
    return res.data;
  },

  async retrieve(id: number) {
    const res = await API.get(`/appointments/${id}/`);
    return res.data;
  },

  async create(data: AppointmentPayload) {
    const res = await API.post("/appointments/", data);
    return res.data;
  },

  async update(id: number, data: AppointmentPayload) {
    const res = await API.put(`/appointments/${id}/`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await API.delete(`/appointments/${id}/`);
    return res.data;
  },
};
