// frontend/src/features/schedule/services/scheduleSettingsApi.ts
import API from "../../../services/api";
import { ScheduleSettings } from "../types";

async function get(): Promise<ScheduleSettings> {
  const res = await API.get("/schedule-settings/");

  if (!Array.isArray(res.data) || res.data.length === 0) {
    throw new Error("No ScheduleSettings row returned from API");
  }

  return res.data[0];
}

async function save(payload: ScheduleSettings): Promise<ScheduleSettings> {
  const res = await API.put(`/schedule-settings/${payload.id}/`, payload);
  return res.data;
}

async function getAppointmentTypes() {
  const settings = await get();
  return settings.appointment_types || [];
}

export const scheduleSettingsApi = {
  get,
  save,
  getAppointmentTypes,
};
