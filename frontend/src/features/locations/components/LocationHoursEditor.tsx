import React from "react";
import { LocationHoursDTO } from "../services/locationApi";

const WEEKDAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

interface Props {
  hours: LocationHoursDTO[];
  onChange: (updated: LocationHoursDTO[]) => void;
}

const LocationHoursEditor: React.FC<Props> = ({ hours, onChange }) => {
  const handleChange = (
    weekday: string,
    field: keyof LocationHoursDTO,
    value: any
  ) => {
    const updated = hours.map((h) =>
      h.weekday === weekday ? { ...h, [field]: value } : h
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {hours.map((h) => (
        <div
          key={h.weekday}
          className="grid grid-cols-12 items-center gap-4 bg-surface dark:bg-surface-dark p-3 rounded-lg border border-border dark:border-border-dark"
        >
          {/* Weekday */}
          <div className="col-span-3 font-medium text-text-primary dark:text-text-darkPrimary">
            {WEEKDAY_LABELS[h.weekday]}
          </div>

          {/* Open Toggle */}
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={h.open}
              onChange={(e) =>
                handleChange(h.weekday, "open", e.target.checked)
              }
            />
            <span className="text-sm text-text-secondary dark:text-text-darkSecondary">
              Open
            </span>
          </div>

          {/* Start Time */}
          <div className="col-span-3">
            <input
              type="time"
              step={900}
              disabled={!h.open}
              className="w-full border bg-input-lighter dark:bg-input-dark border-mBorder-lighter dark:border-mBorder-dark rounded p-2 disabled:bg-side disabled:dark:bg-side-dark"
              value={h.start}
              onChange={(e) => handleChange(h.weekday, "start", e.target.value)}
            />
          </div>

          {/* End Time */}
          <div className="col-span-3">
            <input
              type="time"
              step={900}
              disabled={!h.open}
              className="w-full border bg-input-lighter dark:bg-input-dark border-mBorder-lighter dark:border-mBorder-dark rounded p-2 disabled:bg-side disabled:dark:bg-side-dark"
              value={h.end}
              onChange={(e) => handleChange(h.weekday, "end", e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationHoursEditor;
