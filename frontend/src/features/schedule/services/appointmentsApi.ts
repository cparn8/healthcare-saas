// frontend/src/features/schedule/services/appointmentsApi.ts

import API from "../../../services/api";

/**
 * Payload used for creating or updating an appointment.
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
  duration: number;
  is_recurring: boolean;
  repeat_days?: string[];
  repeat_interval_weeks?: number;
  repeat_end_date?: string | null;
  repeat_occurrences?: number | null;
  send_intake_form?: boolean;
  allow_overlap?: boolean;
  is_block?: boolean;
  status?:
    | "pending"
    | "arrived"
    | "in_room"
    | "no_show"
    | "cancelled"
    | "in_lobby"
    | "seen"
    | "tentative";
  room?: string | null;
  intake_status?: "not_submitted" | "submitted";
  patient_dob?: string | null;
  patient_gender?: string | null;
  patient_phone?: string | null;
}

/**
 * Full appointment returned by the backend.
 */
export interface Appointment extends AppointmentPayload {
  id: number;
  created_at: string;
  updated_at: string;
  patient_name?: string | null;
  provider_name?: string;
}

/* =======================================================================
   INTERNAL — Generic DRF pagination fetcher
   Fully typed. No TS7022 issues.
   ======================================================================= */
interface DRFListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function fetchPaginated<T>(
  url: string,
  params: Record<string, any>
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    // Explicitly typed response fixes TS recursion/inference issues
    const response: { data: DRFListResponse<T> | T[] } = await API.get(
      nextUrl,
      { params }
    );

    const data = response.data;

    // Case 1: backend returned a raw array (no pagination)
    if (Array.isArray(data)) {
      results.push(...data);
      break;
    }

    // Case 2: standard DRF pagination
    if (Array.isArray(data.results)) {
      results.push(...data.results);
      nextUrl = data.next; // includes full URL if paginated
    } else {
      console.warn("⚠️ Unexpected paginated response shape:", data);
      break;
    }

    // Important: when using data.next, DRF already encoded params
    params = {};
  }

  return results;
}

/* =======================================================================
   PUBLIC API
   ======================================================================= */

export const appointmentsApi = {
  /* -------------------------------------------------------------------
     Standard paginated list (Appointments tab, exports, reporting)
     ------------------------------------------------------------------- */
  async list(params: {
    provider?: number | null;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<DRFListResponse<Appointment>> {
    const res = await API.get("/appointments/", { params });
    return res.data;
  },

  /* -------------------------------------------------------------------
     Fetch ALL appointments (used by Schedule.tsx)
     Eliminates disappearing appointments (pagination bug).
     ------------------------------------------------------------------- */
  async listAllAppointments(options: {
    provider?: number | null;
    start_date: string;
    end_date: string;
  }): Promise<Appointment[]> {
    return fetchPaginated<Appointment>("/appointments/", {
      provider: options.provider ?? undefined,
      start_date: options.start_date,
      end_date: options.end_date,
    });
  },

  /* -------------------------------------------------------------------
     Retrieve single appointment
     ------------------------------------------------------------------- */
  async retrieve(id: number): Promise<Appointment> {
    const res = await API.get(`/appointments/${id}/`);
    return res.data;
  },

  /* -------------------------------------------------------------------
     Create new appointment
     ------------------------------------------------------------------- */
  async create(data: AppointmentPayload): Promise<Appointment> {
    const res = await API.post("/appointments/", data);
    return res.data;
  },

  /* -------------------------------------------------------------------
     Update appointment
     ------------------------------------------------------------------- */
  async update(id: number, data: AppointmentPayload): Promise<Appointment> {
    const res = await API.put(`/appointments/${id}/`, data);
    return res.data;
  },

  /* -------------------------------------------------------------------
     Delete appointment
     ------------------------------------------------------------------- */
  async delete(id: number): Promise<void> {
    await API.delete(`/appointments/${id}/`);
  },
};
