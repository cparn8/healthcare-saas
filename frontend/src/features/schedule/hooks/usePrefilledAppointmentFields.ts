import { useEffect, useState } from "react";

interface PrefillOptions {
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  appointmentTypes?: { name: string; default_duration: number }[];
  initialTypeName?: string;
}

/**
 * Centralized prefill and auto-duration logic
 * shared by WithPatientForm and BlockTimeForm.
 */
export function usePrefilledAppointmentFields({
  initialDate,
  initialStartTime,
  initialEndTime,
  appointmentTypes = [],
  initialTypeName,
}: PrefillOptions) {
  // Base values
  const [fields, setFields] = useState({
    date: initialDate || "",
    start_time: initialStartTime || "",
    end_time: initialEndTime || "",
    duration: 30,
  });

  // Keep date/time synced when parent changes slot
  useEffect(() => {
    setFields((prev) => ({
      ...prev,
      date: initialDate || "",
      start_time: initialStartTime || "",
      end_time: initialEndTime || "",
    }));
  }, [initialDate, initialStartTime, initialEndTime]);

  // Auto-update duration when the appointment type changes
  useEffect(() => {
    if (!initialTypeName) return;
    const match = appointmentTypes.find((t) => t.name === initialTypeName);
    if (match && match.default_duration !== fields.duration) {
      setFields((prev) => ({ ...prev, duration: match.default_duration }));
    }
  }, [initialTypeName, appointmentTypes, fields.duration]);

  return fields;
}
