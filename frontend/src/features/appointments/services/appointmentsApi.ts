import API from '../../../services/api';

export interface AppointmentPayload {
  patient?: number | null;
  provider: number;
  office: string;
  appointment_type: string;
  color_code?: string;
  chief_complaint?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_recurring: boolean;
  repeat_days?: string[];
  repeat_interval_weeks?: number;
  repeat_end_date?: string | null;
  repeat_occurrences?: number | null;
}

export const appointmentsApi = {
  async list(params: Record<string, any> = {}) {
    const res = await API.get('/appointments/', { params });
    return res.data;
  },

  async create(data: AppointmentPayload) {
    const res = await API.post('/appointments/', data);
    return res.data;
  },
};
