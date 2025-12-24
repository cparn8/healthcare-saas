import React from "react";
import { AppointmentPayload } from "../../../../services";

interface RepeatSectionProps {
  enabled: boolean;
  formData: AppointmentPayload;
  onToggle: (checked: boolean) => void;
  onChange: (patch: Partial<AppointmentPayload>) => void;
  hideHeaderToggle?: boolean;
}

const WEEKDAYS = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

const RepeatSection: React.FC<RepeatSectionProps> = ({
  enabled,
  formData,
  onToggle,
  onChange,
  hideHeaderToggle = false,
}) => {
  const toggleWeekday = (dayKey: string, checked: boolean) => {
    const current = formData.repeat_days ?? [];
    const updated = checked
      ? [...current, dayKey]
      : current.filter((d) => d !== dayKey);

    onChange({ repeat_days: updated });
  };

  return (
    <div className="space-y-4 mt-2 border-t pt-4">
      {/* Header toggle (optional) */}
      {!hideHeaderToggle && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-text-primary dark:text-text-darkPrimary">
            Repeat
          </span>
        </label>
      )}

      {!enabled ? null : (
        <div className="space-y-4 text-sm">
          {/* Weekday selection */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-text-primary dark:text-text-darkPrimary">
              Occurs On:
            </span>

            {WEEKDAYS.map((day) => (
              <label
                key={day.key}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-600"
                  checked={formData.repeat_days?.includes(day.key) ?? false}
                  onChange={(e) => toggleWeekday(day.key, e.target.checked)}
                />
                <span className="font-medium">{day.label}</span>
              </label>
            ))}
          </div>

          {/* Interval + Ending */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-text-primary dark:text-text-darkPrimary">
              Every
            </span>

            <select
              value={formData.repeat_interval_weeks ?? 1}
              onChange={(e) =>
                onChange({
                  repeat_interval_weeks: Number(e.target.value),
                })
              }
              className="border border-border dark:border-top-dborder bg-grid-slot dark:bg-input-dlight rounded px-2 py-1 text-sm w-20"
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <span className="text-text-primary dark:text-text-darkPrimary">
              week(s)
            </span>

            <div className="h-5 border-l border-text-muted dark:border-text-darkMuted mx-2" />

            {/* End Date */}
            <span className="font-semibold text-text-primary dark:text-text-darkPrimary">
              Ends On
            </span>
            <input
              type="date"
              value={formData.repeat_end_date || ""}
              onChange={(e) => onChange({ repeat_end_date: e.target.value })}
              className="border rounded border-border dark:border-border-dark bg-input-light dark:bg-input-dark px-2 py-1 text-sm"
            />

            <span className="font-semibold text-text-primary dark:text-text-darkPrimary">
              after
            </span>

            {/* Occurrences */}
            <input
              type="number"
              min={1}
              value={formData.repeat_occurrences ?? 1}
              onChange={(e) =>
                onChange({ repeat_occurrences: Number(e.target.value) })
              }
              className="border border-border dark:border-border-dark bg-input-light dark:bg-input-dark rounded w-20 px-2 py-1 text-sm"
            />

            <span className="text-text-primary dark:text-text-darkPrimary">
              appointment(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepeatSection;
