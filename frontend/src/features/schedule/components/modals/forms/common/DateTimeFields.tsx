// frontend/.../DateTimeFields.tsx
import React from "react";
import { AppointmentPayload } from "../../../../services";

interface DateTimeFieldsProps {
  formData: AppointmentPayload;
  onChange: (patch: Partial<AppointmentPayload>) => void;
}

const normalizeTime = (value?: string | null): string => {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
  return "";
};

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="flex gap-12">
      {/* Date */}
      <div className="w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={formData.date || ""}
          onChange={(e) => onChange({ date: e.target.value })}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Start Time */}
      <div className="w-[110px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Time
        </label>
        <input
          type="time"
          step="60"
          value={normalizeTime(formData.start_time)}
          onChange={(e) =>
            onChange({ start_time: normalizeTime(e.target.value) })
          }
          className="w-full border rounded p-2"
        />
      </div>

      {/* End Time */}
      <div className="w-[110px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Time
        </label>
        <input
          type="time"
          step="60"
          value={normalizeTime(formData.end_time)}
          onChange={(e) =>
            onChange({ end_time: normalizeTime(e.target.value) })
          }
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
};

export default DateTimeFields;
