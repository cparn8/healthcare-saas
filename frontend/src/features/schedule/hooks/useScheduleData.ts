// src/features/schedule/hooks/useScheduleData.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { appointmentsApi, Appointment, scheduleSettingsApi } from "../services";
import { ScheduleSettings, AppointmentTypeDef } from "../types";
import { getWeekRangeForApi } from "../logic";

interface UseScheduleDataOptions {
  cursorDate: Date;
  providerId: number | null;
  providerIds: number[] | null;
}

export function useScheduleData({
  cursorDate,
  providerId,
  providerIds,
}: UseScheduleDataOptions) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  const [scheduleSettings, setScheduleSettings] =
    useState<ScheduleSettings | null>(null);

  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentTypeDef[]
  >([]);

  /* ------------------------ Schedule Settings ------------------------ */

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

  /* ------------------------ Provider filter normalization ------------------------ */
  const normalizedProviderIds = useMemo(() => {
    if (!providerIds || providerIds.length === 0) return undefined;
    return providerIds;
  }, [providerIds]);

  /* ------------------------ Appointments (all pages) ------------------------ */

  const reloadAppointments = useCallback(async () => {
    if (!providerId) return;

    setLoadingAppts(true);

    try {
      const { start_date, end_date } = getWeekRangeForApi(cursorDate);

      const fullList = await appointmentsApi.listAllAppointments({
        providers: normalizedProviderIds, // undefined => all providers
        start_date,
        end_date,
      });

      fullList.sort((a, b) => {
        const da = new Date(a.date + "T00:00").getTime();
        const db = new Date(b.date + "T00:00").getTime();
        if (da !== db) return da - db;
        return (a.start_time ?? "").localeCompare(b.start_time ?? "");
      });

      setAppointments(fullList);
    } catch (err) {
      console.error("❌ Failed to load appointments:", err);
      setAppointments([]);
    } finally {
      setLoadingAppts(false);
    }
  }, [providerId, cursorDate, normalizedProviderIds]);

  useEffect(() => {
    void reloadAppointments();
  }, [reloadAppointments]);

  return {
    appointments,
    loadingAppts,
    reloadAppointments,
    scheduleSettings,
    appointmentTypes,
  };
}
