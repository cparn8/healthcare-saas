// src/features/schedule/hooks/useScheduleData.ts
import { useState, useEffect, useCallback } from "react";
import { appointmentsApi, Appointment, scheduleSettingsApi } from "../services";
import { ScheduleSettings, AppointmentTypeDef } from "../types";
import { getWeekRangeForApi } from "../logic";

interface UseScheduleDataOptions {
  cursorDate: Date;
  providerId: number | null;
}

/**
 * Centralized data hook for the Schedule page.
 * - Loads schedule settings
 * - Loads appointment types
 * - Loads appointments for the visible week and provider
 */
export function useScheduleData({
  cursorDate,
  providerId,
}: UseScheduleDataOptions) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  const [scheduleSettings, setScheduleSettings] =
    useState<ScheduleSettings | null>(null);
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentTypeDef[]
  >([]);

  /* ------------------------ Schedule Settings (hours) ------------------------ */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const data = await scheduleSettingsApi.get();
        if (!cancelled) setScheduleSettings(data);
      } catch (err) {
        console.warn("⚠️ Falling back to default hours", err);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------ Appointment Types ------------------------ */

  useEffect(() => {
    let cancelled = false;

    async function loadTypes() {
      try {
        const types = await scheduleSettingsApi.getAppointmentTypes();
        if (!cancelled) setAppointmentTypes(types || []);
      } catch (err) {
        console.error("❌ Failed to load appointment types:", err);
        if (!cancelled) setAppointmentTypes([]);
      }
    }

    loadTypes();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------ Appointments (week range) ------------------------ */

  const reloadAppointments = useCallback(async () => {
    if (!providerId) return;

    setLoadingAppts(true);
    try {
      const { start_date, end_date } = getWeekRangeForApi(cursorDate);

      // Backend already filters by provider + date range
      const list = await appointmentsApi.list({
        provider: providerId,
        start_date,
        end_date,
      });

      const sorted = [...list].sort((a, b) => {
        const da = new Date(a.date + "T00:00").getTime();
        const db = new Date(b.date + "T00:00").getTime();
        if (da !== db) return da - db;
        return (a.start_time ?? "").localeCompare(b.start_time ?? "");
      });

      setAppointments(sorted);
    } catch (err) {
      console.error("❌ Failed to load appointments:", err);
    } finally {
      setLoadingAppts(false);
    }
  }, [providerId, cursorDate]);

  useEffect(() => {
    if (providerId) {
      void reloadAppointments();
    }
  }, [providerId, cursorDate, reloadAppointments]);

  /* -------------------------------- OUTPUT -------------------------------- */

  return {
    appointments,
    loadingAppts,
    reloadAppointments,
    scheduleSettings,
    appointmentTypes,
  };
}
