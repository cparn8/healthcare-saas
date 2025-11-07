// frontend/src/features/schedule/services/scheduleSettingsApi.ts
import API from "../../../services/api";
import { ScheduleSettings } from "../types/scheduleSettings";

const LOCAL_STORAGE_KEY = "scheduleSettings";
const SETTINGS_ID = 1; // the single row in DB

async function get(): Promise<ScheduleSettings> {
  try {
    const res = await API.get(`/schedule-settings/${SETTINGS_ID}/`);
    return res.data;
  } catch (error: any) {
    // fallback only if no record exists yet
    if (error.response?.status === 404) {
      const localSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localSettings) {
        return JSON.parse(localSettings);
      }
    }
    throw error;
  }
}

async function save(payload: ScheduleSettings): Promise<ScheduleSettings> {
  try {
    const res = await API.put(`/schedule-settings/${SETTINGS_ID}/`, payload);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      return payload;
    }
    throw error;
  }
}

export const scheduleSettingsApi = {
  get,
  save,
};
