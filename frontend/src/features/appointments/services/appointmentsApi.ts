// src/features/appointments/services/appointmentsApi.ts
import API from '../../../services/api';

export interface AppointmentPayload {
  patient?: number | null;
  provider: number;
  office: 'north' | 'south';
  appointment_type?: string;
  color_code?: string;
  chief_complaint?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  is_recurring?: boolean;
  repeat_days?: string[];
  repeat_interval_weeks?: number;
  repeat_end_date?: string | null;
  repeat_occurrences?: number | null;
  send_intake_form?: boolean;
}

export const appointmentsApi = {
  async list() {
    const res = await API.get('/appointments/');
    return res.data.results;
  },

  async create(payload: AppointmentPayload) {
    const res = await API.post('/appointments/', payload);
    return res.data;
  },

  async get(id: number) {
    const res = await API.get(`/appointments/${id}/`);
    return res.data;
  },

  async update(id: number, payload: Partial<AppointmentPayload>) {
    const res = await API.put(`/appointments/${id}/`, payload);
    return res.data;
  },

  async remove(id: number) {
    await API.delete(`/appointments/${id}/`);
  },
};
