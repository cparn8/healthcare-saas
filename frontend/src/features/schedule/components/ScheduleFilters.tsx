// src/features/schedule/components/ScheduleFilters.tsx
import React, { useEffect, useState } from "react";
import { AppointmentTypeDef, ScheduleFilters, STATUS_DEFS } from "../types";
import { Provider } from "../../providers/services/providersApi";

interface ScheduleFiltersProps {
  providerId: number | null;
  allProviders: Provider[];
  appointmentTypes: AppointmentTypeDef[];
  currentFilters: ScheduleFilters;
  onUpdateFilters: (filters: ScheduleFilters) => void;
}

const ScheduleFiltersComponent: React.FC<ScheduleFiltersProps> = ({
  providerId,
  allProviders,
  appointmentTypes,
  currentFilters,
  onUpdateFilters,
}) => {
  const [localFilters, setLocalFilters] =
    useState<ScheduleFilters>(currentFilters);

  // Load saved filters for this provider
  useEffect(() => {
    if (providerId) {
      const saved = localStorage.getItem(`scheduleFilters_${providerId}`);
      if (saved) setLocalFilters(JSON.parse(saved));
    }
  }, [providerId]);

  // Save filters when local changes
  useEffect(() => {
    onUpdateFilters(localFilters);
    if (providerId) {
      localStorage.setItem(
        `scheduleFilters_${providerId}`,
        JSON.stringify(localFilters)
      );
    }
  }, [localFilters, onUpdateFilters, providerId]);

  const toggleMultiSelect = (
    field: "providers" | "types" | "statuses",
    id: number | string
  ) => {
    setLocalFilters((prev) => {
      // Make sure to narrow to array type
      const currentArray = prev[field] as (typeof id)[];
      const isIncluded = currentArray.includes(id);

      return {
        ...prev,
        [field]: isIncluded
          ? currentArray.filter((val) => val !== id)
          : [...currentArray, id],
      };
    });
  };

  return (
    <div className="w-60 p-4 bg-gray-100 border-r space-y-6">
      <h3 className="text-lg font-semibold">Filters</h3>
      {/* Users */}
      <div>
        <details open>
          <summary className="cursor-pointer text-sm font-medium">
            Users
          </summary>
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localFilters.providers.length === allProviders.length}
                onChange={(e) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    providers: e.target.checked
                      ? allProviders
                          .map((p) => p.id!)
                          .filter((id): id is number => id !== undefined)
                      : [],
                  }));
                }}
              />
              <span>All Providers</span>
            </label>
            {allProviders.map((p) => (
              <label key={p.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.providers.includes(p.id!)}
                  onChange={() => toggleMultiSelect("providers", p.id!)}
                />
                <span>{`${p.first_name} ${p.last_name}`}</span>
              </label>
            ))}
          </div>
        </details>
      </div>
      {/* Appointment Types */}
      <div>
        <details open>
          <summary className="cursor-pointer text-sm font-medium">
            Appointment Types
          </summary>
          <div className="mt-2 space-y-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  localFilters.types?.length === appointmentTypes.length ||
                  localFilters.types?.length === 0
                }
                onChange={(e) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    types: e.target.checked
                      ? appointmentTypes.map((t) => t.name)
                      : [],
                  }));
                }}
              />
              <span>All Types</span>
            </label>
            {appointmentTypes.map((t) => (
              <label key={t.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.types.includes(t.name)}
                  onChange={() => toggleMultiSelect("types", t.name)}
                />
                <span>{t.name}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* Appointment Status */}
      <div>
        <details open>
          <summary className="cursor-pointer text-sm font-medium">
            Appointment Status
          </summary>
          <div className="mt-2 space-y-1">
            {/* All Statuses toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  localFilters.statuses.length === 0 ||
                  localFilters.statuses.length === STATUS_DEFS.length
                }
                onChange={(e) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    statuses: e.target.checked
                      ? STATUS_DEFS.map((s) => s.key)
                      : [],
                  }));
                }}
              />
              <span>All Statuses</span>
            </label>

            {STATUS_DEFS.map((s) => (
              <label key={s.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.statuses.includes(s.key)}
                  onChange={() => toggleMultiSelect("statuses", s.key)}
                />
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>
      {/* Display Options */}
      <div>
        <details open>
          <summary className="cursor-pointer text-sm font-medium">
            Display Options
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <span className="text-xs text-gray-600">Default View:</span>
              <select
                className="mt-1 w-full border rounded p-1 text-sm"
                value={localFilters.defaultView}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    defaultView: e.target
                      .value as ScheduleFilters["defaultView"],
                  }))
                }
              >
                <option value="appointments">Appointments</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.includeBlockedTimes}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      includeBlockedTimes: e.target.checked,
                    }))
                  }
                />
                <span>Include Blocked Times</span>
              </label>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ScheduleFiltersComponent;
