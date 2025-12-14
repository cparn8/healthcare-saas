import React from "react";
import { LocationDTO } from "../../../../../locations/services/locationApi";

interface OfficeSelectProps {
  value: string | null;
  onChange: (office: string) => void;
  locations: LocationDTO[];
  label?: string;
  disabled?: boolean;
}

const OfficeSelect: React.FC<OfficeSelectProps> = ({
  value,
  onChange,
  locations,
  label = "Facility",
  disabled = false,
}) => {
  const activeLocations = locations.filter((l) => l.is_active);

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || activeLocations.length === 0}
        className="w-full border rounded p-2 disabled:bg-gray-100"
      >
        {activeLocations.length === 0 && (
          <option value="" disabled>
            No locations available
          </option>
        )}

        {activeLocations.map((loc) => (
          <option key={loc.id} value={loc.slug}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OfficeSelect;
