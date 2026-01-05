// frontend/src/features/schedule/components/modals/NewAppointmentModal.tsx

import React, { useState, useEffect } from "react";
import X from "lucide-react/dist/esm/icons/x";
import WithPatientForm from "./forms/WithPatientForm";
import BlockTimeForm from "./forms/BlockTimeForm";
import { appointmentsApi, AppointmentPayload } from "../../services";
import { LocationDTO } from "../../../locations/services/locationApi";
import {
  toastError,
  toastSuccess,
  parseLocalDate,
  formatYMDLocal,
} from "../../../../utils";
import {
  handleOverlapDuringSave,
  detectOverlapError,
} from "../../logic/detectConflict";

interface NewAppointmentModalProps {
  onClose: () => void;
  onSaved: () => void;
  providerId?: number | null;

  primaryOfficeSlug?: string | null;

  initialDate?: Date;
  initialStartTime?: Date;
  initialEndTime?: Date;

  initialPatient?: any;
  appointmentTypes?: {
    id?: number;
    name: string;
    default_duration: number;
    color_code: string;
  }[];
  scheduleSettings?: any;
  locations: LocationDTO[];
  requestConfirm?: (message: string) => Promise<boolean>;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  onClose,
  onSaved,
  providerId,
  initialDate,
  initialStartTime,
  initialEndTime,
  primaryOfficeSlug,
  initialPatient,
  appointmentTypes,
  scheduleSettings,
  locations,
  requestConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<"withPatient" | "blockTime">(
    "withPatient"
  );
  const [formData, setFormData] = useState<AppointmentPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Time sync (safe for TS, kept for future use if needed) ---
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [startTime, setStartTime] = useState<string>(
    initialStartTime ? initialStartTime.toTimeString().slice(0, 5) : ""
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [endTime, setEndTime] = useState<string>(
    initialEndTime ? initialEndTime.toTimeString().slice(0, 5) : ""
  );

  useEffect(() => {
    if (initialStartTime)
      setStartTime(initialStartTime.toTimeString().slice(0, 5));
    if (initialEndTime) setEndTime(initialEndTime.toTimeString().slice(0, 5));
  }, [initialStartTime, initialEndTime]);

  function normalizeToTimeString(value?: Date | string | null): string {
    if (!value) return "";
    if (value instanceof Date) return value.toTimeString().slice(0, 5);
    if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) return value; // already "HH:mm"
    const date = new Date(value);
    return isNaN(date.getTime()) ? "" : date.toTimeString().slice(0, 5);
  }

  // Helper for creating recurring appointments (reused for normal + overlap flows)
  const createRecurrencesIfNeeded = async (
    basePayload: AppointmentPayload,
    safeDate: string
  ) => {
    if (!formData || !formData.is_recurring) return;

    try {
      const repeatDays = formData.repeat_days ?? [];
      const intervalWeeks = formData.repeat_interval_weeks ?? 1;
      const maxOccurrences = formData.repeat_occurrences ?? 1;
      const startDate = parseLocalDate(safeDate);
      const endDate = formData.repeat_end_date
        ? parseLocalDate(formData.repeat_end_date)
        : null;

      const targetDays = repeatDays.map((d) =>
        ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(
          d.toLowerCase().slice(0, 3)
        )
      );

      const generatedDates: string[] = [];
      let current = new Date(startDate);

      while (generatedDates.length < maxOccurrences - 1) {
        current = new Date(current);
        current.setDate(current.getDate() + 1);

        if (endDate && current > endDate) break;

        const jsDay = current.getDay();
        const weekDiff =
          (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7);

        if (
          targetDays.includes(jsDay) &&
          Math.floor(weekDiff) % intervalWeeks === 0
        ) {
          generatedDates.push(formatYMDLocal(current));
        }
      }

      const uniqueDates = Array.from(new Set(generatedDates)).sort();

      console.log("🧭 Final Repeat Generation Check", {
        startDate: safeDate,
        repeatDays,
        intervalWeeks,
        maxOccurrences,
        endDate: endDate?.toISOString().split("T")[0],
        generated: uniqueDates,
      });

      if (uniqueDates.length > 0) {
        await Promise.all(
          uniqueDates.map((d) =>
            appointmentsApi.create({
              ...basePayload,
              date: d,
              is_recurring: true,
            })
          )
        );
        toastSuccess(
          `Created ${uniqueDates.length + 1} recurring appointments!`
        );
      }
    } catch (err) {
      console.error("❌ Repeat creation failed:", err);
      toastError("Some repeat appointments could not be created.");
    }
  };

  // -------------------------------
  // Handle Save
  // -------------------------------
  async function handleSave() {
    if (!formData) {
      toastError("Please complete the appointment form before saving.");
      return;
    }
    if (!providerId) {
      toastError("Provider ID missing — please log in as a provider.");
      return;
    }
    if (activeTab === "withPatient" && !formData.patient) {
      toastError("No patient selected.");
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      toastError("Please provide valid start and end times.");
      return;
    }
    if (formData.start_time >= formData.end_time) {
      toastError("Start time must be before end time.");
      return;
    }
    if (
      formData.is_recurring &&
      formData.repeat_end_date &&
      formData.date &&
      formData.repeat_end_date < formData.date
    ) {
      toastError("Start date must be before end date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const slotRaw = sessionStorage.getItem("pendingSlot");
      const slot = slotRaw ? JSON.parse(slotRaw) : null;

      const rawDate = slot?.date || formData.date;
      const safeDateValue =
        rawDate && typeof rawDate === "string" && rawDate.includes("T")
          ? rawDate.split("T")[0]
          : rawDate;

      const safeDate = safeDateValue as string;
      const chosenOffice = (formData.office ?? "").trim();
      const resolvedOffice = chosenOffice || slot?.office || primaryOfficeSlug;

      if (!resolvedOffice) {
        toastError("No location selected for this appointment.");
        setIsSubmitting(false);
        return;
      }

      let payload: AppointmentPayload = {
        ...formData,
        provider: formData.provider ?? providerId ?? 1,
        office: resolvedOffice,
        repeat_end_date: formData.repeat_end_date || null,
        date: safeDate,
        start_time: slot?.start_time || formData.start_time,
        end_time: slot?.end_time || formData.end_time,
        allow_overlap: !!slot?.allow_overlap || !!formData.allow_overlap,
      };

      if (activeTab === "blockTime") {
        payload.patient = null;
        payload.appointment_type = formData.appointment_type || "Block Time";
        (payload as any).is_block_time = true;

        if ((formData as any).all_providers) {
          payload.provider = null;
          (payload as any).all_providers = true;
        }
      }

      // First attempt — no overlap override beyond what payload already has.
      try {
        await appointmentsApi.create(payload);
        toastSuccess("✅ Appointment saved successfully!");
        await createRecurrencesIfNeeded(payload, safeDate);
        onSaved();
        onClose();
        return;
      } catch (err) {
        console.error("❌ Appointment save failed (first attempt):", err);

        // Check for overlap and use styled confirm dialog if so
        const allowed = await handleOverlapDuringSave(
          err,
          payload.office,
          requestConfirm
        );
        const overlapInfo = detectOverlapError(err);

        if (!allowed) {
          // If it wasn't an overlap error at all, show generic error
          if (!overlapInfo.isOverlap) {
            toastError("Unexpected error while saving appointment.");
          }
          // If it WAS overlap but user canceled → no extra toast.
          return;
        }

        // User approved the overlap → retry with allow_overlap = true
        const overlapPayload: AppointmentPayload = {
          ...payload,
          allow_overlap: true,
        };

        await appointmentsApi.create(overlapPayload);
        toastSuccess("✅ Appointment saved successfully (overlap allowed).");
        await createRecurrencesIfNeeded(overlapPayload, safeDate);
        onSaved();
        onClose();
      }
    } catch (finalErr) {
      console.error("❌ Appointment save failed (final):", finalErr);
      toastError("Unexpected error while saving appointment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="fixed inset left-0 top-10 right-0 bottom-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-bg dark:border-bg-dark">
          <h2 className="text-xl font-semibold">New Appointment</h2>
          <button
            onClick={onClose}
            className="text-text-secondary dark:text-text-darkSecondary hover:text-text-primary hover:dark:text-text-darkPrimary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border dark:border-border-dark text-sm font-medium">
          <button
            className={`px-6 py-2 ${
              activeTab === "withPatient"
                ? "border-b-2 border-primary text-primary"
                : "hover:border-b-2 hover:border-text-primary dark:hover:border-text-darkPrimary text-text-secondary dark:text-text-darkSecondary hover:text-text-primary hover:dark:text-text-darkPrimary"
            }`}
            onClick={() => setActiveTab("withPatient")}
          >
            With Patient
          </button>
          <button
            className={`px-6 py-2 ${
              activeTab === "blockTime"
                ? "border-b-2 border-primary text-primary"
                : "hover:border-b-2 hover:border-text-primary dark:hover:border-text-darkPrimary text-text-secondary dark:text-text-darkSecondary hover:text-text-primary hover:dark:text-text-darkPrimary"
            }`}
            onClick={() => setActiveTab("blockTime")}
          >
            Block Time
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {activeTab === "withPatient" ? (
            <WithPatientForm
              providerId={providerId}
              locations={locations}
              onGetFormData={(data: AppointmentPayload) => setFormData(data)}
              initialDate={
                initialDate ? initialDate.toISOString().split("T")[0] : ""
              }
              initialStartTime={normalizeToTimeString(initialStartTime)}
              initialEndTime={normalizeToTimeString(initialEndTime)}
              initialPatient={initialPatient}
              primaryOfficeSlug={primaryOfficeSlug ?? null}
              appointmentTypes={appointmentTypes}
            />
          ) : (
            <BlockTimeForm
              providerId={providerId}
              locations={locations}
              appointmentTypes={appointmentTypes}
              scheduleSettings={scheduleSettings}
              onGetFormData={(data: AppointmentPayload) => setFormData(data)}
              onCancel={onClose}
              initialDate={
                initialDate ? initialDate.toISOString().split("T")[0] : ""
              }
              initialStartTime={normalizeToTimeString(initialStartTime)}
              initialEndTime={normalizeToTimeString(initialEndTime)}
              primaryOfficeSlug={primaryOfficeSlug ?? null}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-bg dark:border-bg-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-input-lighter transition ${
              isSubmitting
                ? "bg-gray-400 cursor-wait"
                : "bg-grncon hover:bg-grncon-hover"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
