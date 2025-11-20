// src/features/schedule/components/ScheduleFilters.tsx
import React, { useEffect, useState, useCallback } from "react";
import { AppointmentTypeDef, ScheduleFilters, STATUS_DEFS } from "../../types";
import { Provider } from "../../../providers/services/providersApi";

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

  /* ------------------------------------------------------------------ */
  /* Persistence (load + save)                                          */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!providerId) return;

    const saved = localStorage.getItem(`scheduleFilters_${providerId}`);
    if (saved) {
      try {
        setLocalFilters(JSON.parse(saved));
      } catch {
        // corrupt localStorage, ignore
      }
    }
  }, [providerId]);

  useEffect(() => {
    onUpdateFilters(localFilters);

    if (providerId) {
      localStorage.setItem(
        `scheduleFilters_${providerId}`,
        JSON.stringify(localFilters)
      );
    }
  }, [localFilters, onUpdateFilters, providerId]);

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                      */
  /* ------------------------------------------------------------------ */

  // Generic toggle for multi-select arrays
  const toggleMulti = useCallback(
    <T,>(field: keyof ScheduleFilters, value: T) => {
      setLocalFilters((prev) => {
        const arr = prev[field] as T[];
        const next = arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value];

        return { ...prev, [field]: next };
      });
    },
    []
  );

  const areAllSelected = <T,>(field: keyof ScheduleFilters, full: T[]) => {
    const arr = localFilters[field] as T[];
    return arr.length === full.length;
  };

  const selectAll = <T,>(field: keyof ScheduleFilters, full: T[]) => {
    setLocalFilters((prev) => ({ ...prev, [field]: [...full] }));
  };

  const clearAll = (field: keyof ScheduleFilters) => {
    setLocalFilters((prev) => ({ ...prev, [field]: [] }));
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="w-60 p-4 bg-gray-100 border-r space-y-6 text-sm">
      <h3 className="text-lg font-semibold mb-2">Filters</h3>

      {/* ---------------- Providers ---------------- */}
      <details open>
        <summary className="cursor-pointer font-medium">Users</summary>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {/* Select all providers */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={areAllSelected(
                "providers",
                allProviders.map((p) => p.id!)
              )}
              onChange={(e) =>
                e.target.checked
                  ? selectAll(
                      "providers",
                      allProviders
                        .map((p) => p.id!)
                        .filter((id): id is number => id !== undefined)
                    )
                  : clearAll("providers")
              }
            />
            <span>All Providers</span>
          </label>

          {allProviders.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localFilters.providers.includes(p.id!)}
                onChange={() => toggleMulti("providers", p.id!)}
              />
              <span>{`${p.first_name} ${p.last_name}`}</span>
            </label>
          ))}
        </div>
      </details>

      {/* ---------------- Offices ---------------- */}
      <details open>
        <summary className="cursor-pointer font-medium">Offices</summary>
        <div className="mt-2 space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={areAllSelected("offices", ["north", "south"])}
              onChange={(e) =>
                e.target.checked
                  ? selectAll("offices", ["north", "south"])
                  : clearAll("offices")
              }
            />
            <span>All Offices</span>
          </label>

          {["north", "south"].map((office) => (
            <label key={office} className="flex items-center gap-2 capitalize">
              <input
                type="checkbox"
                checked={localFilters.offices.includes(office)}
                onChange={() => toggleMulti("offices", office)}
              />
              <span>{office} Office</span>
            </label>
          ))}
        </div>
      </details>

      {/* ---------------- Appointment Types ---------------- */}
      <details open>
        <summary className="cursor-pointer font-medium">
          Appointment Types
        </summary>
        <div className="mt-2 space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={areAllSelected(
                "types",
                appointmentTypes.map((t) => t.name)
              )}
              onChange={(e) =>
                e.target.checked
                  ? selectAll(
                      "types",
                      appointmentTypes.map((t) => t.name)
                    )
                  : clearAll("types")
              }
            />
            <span>All Types</span>
          </label>

          {appointmentTypes.map((t) => (
            <label key={t.name} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localFilters.types.includes(t.name)}
                onChange={() => toggleMulti("types", t.name)}
              />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
      </details>

      {/* ---------------- Appointment Statuses ---------------- */}
      <details open>
        <summary className="cursor-pointer font-medium">
          Appointment Status
        </summary>
        <div className="mt-2 space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={areAllSelected(
                "statuses",
                STATUS_DEFS.map((s) => s.key)
              )}
              onChange={(e) =>
                e.target.checked
                  ? selectAll(
                      "statuses",
                      STATUS_DEFS.map((s) => s.key)
                    )
                  : clearAll("statuses")
              }
            />
            <span>All Statuses</span>
          </label>

          {STATUS_DEFS.map((s) => (
            <label key={s.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localFilters.statuses.includes(s.key)}
                onChange={() => toggleMulti("statuses", s.key)}
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

      {/* ---------------- Display Options ---------------- */}
      <details open>
        <summary className="cursor-pointer font-medium">
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
                  defaultView: e.target.value as ScheduleFilters["defaultView"],
                }))
              }
            >
              <option value="appointments">Appointments</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
            </select>
          </div>

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
      </details>
    </div>
  );
};

export default ScheduleFiltersComponent;
