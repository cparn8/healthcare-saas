// frontend/src/features/schedule/components/BlockTimeForm.tsx
import React, { useState, useEffect } from "react";
import {
  providersApi,
  Provider,
} from "../../../../providers/services/providersApi";
import { AppointmentPayload } from "../../../services";
import { usePrefilledAppointmentFields } from "../../../hooks";

interface BlockTimeFormProps {
  onGetFormData?: (data: AppointmentPayload) => void;
  providerId?: number | null;
  appointmentTypes?: {
    id?: number;
    name: string;
    default_duration: number;
    color_code: string;
  }[];
  scheduleSettings?: any;
  onCancel: () => void;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  defaultOffice?: string;
}

const BlockTimeForm: React.FC<BlockTimeFormProps> = ({
  onGetFormData,
  providerId,
  appointmentTypes,
  scheduleSettings,
  onCancel,
  initialDate,
  initialStartTime,
  initialEndTime,
  defaultOffice,
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [allProviders, setAllProviders] = useState(false);
  const prefilled = usePrefilledAppointmentFields({
    initialDate,
    initialStartTime,
    initialEndTime,
    appointmentTypes,
  });

  const [formData, setFormData] = useState<AppointmentPayload>({
    provider: providerId ?? null,
    office: defaultOffice ?? "north",
    appointment_type: "Block Time",
    date: prefilled.date,
    start_time: prefilled.start_time,
    end_time: prefilled.end_time,
    duration: prefilled.duration,
    is_recurring: false,
    repeat_days: [],
    repeat_interval_weeks: 1,
    repeat_end_date: "",
    repeat_occurrences: 1,
    chief_complaint: "",
    notes: "",
    is_block: true,
  });

  const [repeatEnabled, setRepeatEnabled] = useState(false);

  // Fetch providers
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setProvidersLoading(true);
        const list = await providersApi.list();
        if (!active) return;
        setProviders(list);
      } catch (err) {
        console.error("❌ Provider fetch error:", err);
        setProvidersError("Failed to load providers.");
      } finally {
        if (active) setProvidersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Bubble data up
  useEffect(() => {
    const payload = { ...formData } as any;
    if (allProviders) payload.all_providers = true;
    onGetFormData?.(payload);
  }, [formData, allProviders, onGetFormData]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: prefilled.date,
      start_time: prefilled.start_time,
      end_time: prefilled.end_time,
    }));
  }, [prefilled]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let next: any = value;
    if (type === "checkbox") next = (e.target as HTMLInputElement).checked;
    setFormData((p) => ({ ...p, [name]: next }));
  };

  return (
    <div className="space-y-6">
      {/* --- Provider & Office --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Block Time For
          </label>
          {providersLoading ? (
            <div className="flex items-center gap-2 border rounded p-2 text-gray-500 bg-gray-50">
              <svg
                className="animate-spin h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Loading providers…
            </div>
          ) : (
            <select
              name="provider"
              className="w-full border rounded p-2"
              value={allProviders ? "__ALL__" : formData.provider ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__ALL__") {
                  setAllProviders(true);
                  setFormData((p) => ({ ...p, provider: null })); // null means “all” for now
                } else {
                  setAllProviders(false);
                  setFormData((p) => ({
                    ...p,
                    provider: v ? Number(v) : null,
                  }));
                }
              }}
            >
              <option value="">Select provider</option>
              <option value="__ALL__">All Providers</option>
              {providersError && <option disabled>{providersError}</option>}
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
                    `Provider #${p.id}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facility
          </label>
          <select
            name="office"
            value={formData.office}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="north">North Office</option>
            <option value="south">South Office</option>
          </select>
        </div>
      </div>

      {/* --- Date & Time --- */}
      <div className="grid grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            step="60"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="time"
            step="60"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Repeat Toggle */}
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={repeatEnabled}
            onChange={(e) => {
              setRepeatEnabled(e.target.checked);
              setFormData((prev) => ({
                ...prev,
                is_recurring: e.target.checked,
              }));
            }}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-700">Repeat</span>
        </label>
      </div>

      {/* Repeat Section */}
      {repeatEnabled && (
        <div className="border-t pt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-800 whitespace-nowrap">
              Occurs On:
            </span>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.repeat_days?.includes(day)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...(formData.repeat_days || []), day]
                      : formData.repeat_days?.filter((d) => d !== day);
                    setFormData((prev) => ({
                      ...prev,
                      repeat_days: updated,
                    }));
                  }}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="font-medium">{day}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-800">Every</span>
            <select
              name="repeat_interval_weeks"
              value={formData.repeat_interval_weeks}
              onChange={handleChange}
              className="border rounded px-2 py-1 text-sm w-20"
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-800">week(s)</span>

            <span className="font-semibold text-gray-800 ml-4">Ends On</span>
            <input
              type="date"
              name="repeat_end_date"
              value={formData.repeat_end_date ?? ""}
              onChange={handleChange}
              className="border rounded px-2 py-1 text-sm"
            />

            <span className="font-semibold text-gray-800 ml-4">after</span>
            <input
              type="number"
              name="repeat_occurrences"
              min={1}
              value={formData.repeat_occurrences ?? 1}
              onChange={handleChange}
              className="border rounded w-20 px-2 py-1 text-sm"
            />
            <span className="text-gray-800">occurrence(s)</span>
          </div>
        </div>
      )}

      {/* --- Reason --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <select
          name="appointment_type"
          value={formData.appointment_type}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select reason</option>
          <option value="Out of Office">Out of Office</option>
          <option value="Meeting">Meeting</option>
          <option value="Surgery">Surgery</option>
          <option value="Lunch">Lunch</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* --- Description --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="chief_complaint"
          rows={2}
          value={formData.chief_complaint || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Optional short description..."
        />
      </div>

      {/* --- Notes --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={2}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Additional details (optional)"
        />
      </div>
    </div>
  );
};

export default BlockTimeForm;
