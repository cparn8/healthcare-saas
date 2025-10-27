import axios from 'axios';

// --- Base Axios instance ---
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export interface AppointmentPayload {
  patient: number | null;
  provider: number;
  office: 'north' | 'south';
  appointment_type: string;
  color_code: string;
  chief_complaint: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_recurring: boolean;
  repeat_days: string[];
  repeat_interval_weeks: number;
  repeat_end_date: string | null;
  repeat_occurrences: number | null;
  send_intake_form?: boolean;
}

export const appointmentsApi = {
  async create(payload: AppointmentPayload) {
    const res = await api.post('/appointments/', payload);
    return res.data;
  },

  async list(params?: Record<string, any>) {
    const res = await api.get('/appointments/', { params });
    return res.data;
  },
};
