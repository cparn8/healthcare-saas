import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import WithPatientForm from "./WithPatientForm";
import {
  appointmentsApi,
  AppointmentPayload,
} from "../../appointments/services/appointmentsApi";
import {
  toastError,
  toastSuccess,
  toastPromise,
} from "../../../utils/toastUtils";

interface NewAppointmentModalProps {
  onClose: () => void;
  onSaved: () => void;
  providerId?: number | null;
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
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  onClose,
  onSaved,
  providerId,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialPatient,
  appointmentTypes,
  scheduleSettings,
}) => {
  const [activeTab, setActiveTab] = useState<"withPatient" | "blockTime">(
    "withPatient"
  );
  const [formData, setFormData] = useState<AppointmentPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse "YYYY-MM-DD" as a *local* date (midnight local time)
  function parseLocalDate(ymd: string): Date {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  // Format a Date to "YYYY-MM-DD" in *local* time
  function formatYMDLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function handleSave() {
    if (!formData) {
      toastError("Please complete the appointment form before saving.");
      return;
    }
    if (!providerId) {
      toastError("Provider ID missing — please log in as a provider.");
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      toastError("Please provide valid start and end times.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Read pending slot data (including allow_overlap)
      const slotRaw = sessionStorage.getItem("pendingSlot");
      const slot = slotRaw ? JSON.parse(slotRaw) : null;

      const payload: AppointmentPayload = {
        ...formData,
        provider: formData.provider ?? providerId ?? 1,
        office: formData.office || "north",
        repeat_end_date: formData.repeat_end_date || null,
        date: slot?.date || formData.date,
        start_time: slot?.start_time || formData.start_time,
        end_time: slot?.end_time || formData.end_time,
        allow_overlap: !!slot?.allow_overlap,
      };

      // Match color/duration from appointment type
      if (formData.appointment_type && Array.isArray(appointmentTypes)) {
        const selected = appointmentTypes.find(
          (t) => t.name === formData.appointment_type
        );
        if (selected) {
          payload.color_code = selected.color_code;
          payload.duration = selected.default_duration;
        }
      }

      // Validation for recurrence
      if (formData.is_recurring) {
        const startDate = new Date(formData.date);
        const endDate = formData.repeat_end_date
          ? new Date(formData.repeat_end_date)
          : null;

        if (endDate && endDate < startDate) {
          toastError(
            "Repeat end date cannot be before the initial appointment date."
          );
          return;
        }

        if ((formData.repeat_occurrences ?? 1) < 1) {
          toastError("Number of repeat appointments must be at least 1.");
          return;
        }

        if (!formData.repeat_days || formData.repeat_days.length === 0) {
          toastError(
            "Please select at least one weekday for the recurring appointments."
          );
          return;
        }
      }

      // --- Save initial appointment ---
      const created = await toastPromise(appointmentsApi.create(payload), {
        loading: "Saving appointment...",
        success: "✅ Appointment saved successfully!",
        error: "❌ Failed to save appointment.",
      });

      // --- Generate and save repeat appointments (LOCAL date math) ---
      if (formData.is_recurring && created?.id) {
        try {
          const dayMap: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
          };

          const repeatDays = formData.repeat_days ?? [];
          const targetDays = repeatDays.map((d) => dayMap[d]);
          const intervalWeeks = formData.repeat_interval_weeks ?? 1;
          const maxOccurrences = formData.repeat_occurrences ?? 1;

          // Parse as *local* dates
          const startDate = parseLocalDate(formData.date);
          const endDate = formData.repeat_end_date
            ? parseLocalDate(formData.repeat_end_date)
            : null;

          // (Optional) guardrails you already had
          if (endDate && endDate < startDate) {
            toastError(
              "Repeat end date cannot be before the initial appointment date."
            );
            return;
          }

          // Build repeat dates (excluding the initial date)
          const generatedDates: string[] = [];

          targetDays.forEach((targetDow) => {
            // Find the first target weekday strictly *after* startDate
            const first = new Date(startDate);
            const startDow = first.getDay(); // local
            let diff = (targetDow - startDow + 7) % 7;
            if (diff === 0) diff = 7; // skip the same day to avoid duplicating initial
            first.setDate(first.getDate() + diff);

            // Then jump in week intervals
            for (let i = 0; i < maxOccurrences - 1; i++) {
              const next = new Date(first);
              next.setDate(first.getDate() + i * intervalWeeks * 7);

              if (endDate && next > endDate) break;

              generatedDates.push(formatYMDLocal(next));
            }
          });

          // Dedup & sort
          const uniqueDates = Array.from(new Set(generatedDates)).sort();

          // Create repeats
          if (uniqueDates.length > 0) {
            await Promise.all(
              uniqueDates.map((d) =>
                appointmentsApi.create({
                  ...payload,
                  date: d, // already local YYYY-MM-DD
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
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ Appointment save failed:", err);
      toastError("Unexpected error while saving appointment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">New Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b text-sm font-medium">
          <button
            className={`px-6 py-2 ${
              activeTab === "withPatient"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("withPatient")}
          >
            With Patient
          </button>
          <button
            className={`px-6 py-2 ${
              activeTab === "blockTime"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("blockTime")}
          >
            Block Time
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "withPatient" ? (
            <WithPatientForm
              providerId={providerId}
              onCancel={onClose}
              onGetFormData={(data: AppointmentPayload) => setFormData(data)}
              initialDate={initialDate?.toISOString().split("T")[0]}
              initialStartTime={initialStartTime?.toTimeString().slice(0, 5)}
              initialEndTime={initialEndTime?.toTimeString().slice(0, 5)}
              initialPatient={initialPatient}
              appointmentTypes={appointmentTypes}
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Block Time</h3>
              <p className="text-sm text-gray-600">
                Reserve time for lunch, meetings, or administrative work.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-white transition ${
              isSubmitting
                ? "bg-gray-400 cursor-wait"
                : "bg-green-600 hover:bg-green-700"
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
