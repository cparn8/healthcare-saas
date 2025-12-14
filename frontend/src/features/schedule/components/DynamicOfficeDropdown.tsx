import React, { useState } from "react";
import { LocationDTO } from "../../locations/services/locationApi";

interface Props {
  locations: LocationDTO[];
  selected: string[]; // selected slugs
  onChange: (slugs: string[]) => void;
}

const DynamicOfficeDropdown: React.FC<Props> = ({
  locations,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const activeLocations = locations.filter((l) => l.is_active);

  const allSelected =
    activeLocations.length > 0 &&
    selected.length === activeLocations.length &&
    activeLocations.every((l) => selected.includes(l.slug));

  const toggleOffice = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onChange(activeLocations.map((l) => l.slug));
    } else {
      onChange([]);
    }
  };

  const displayLabel =
    selected.length === 0
      ? "No Location Selected"
      : selected
          .map((slug) => activeLocations.find((l) => l.slug === slug)?.name)
          .filter(Boolean)
          .join(", ");

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 border rounded bg-white min-w-[200px] text-left"
      >
        {displayLabel}
      </button>

      {open && (
        <div className="absolute mt-1 w-56 bg-white border rounded shadow-lg z-30 p-2">
          {/* ALL */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            <span>Select All</span>
          </label>

          <hr className="my-2" />

          {/* INDIVIDUAL LOCATIONS */}
          {activeLocations.map((loc) => (
            <label
              key={loc.id}
              className="flex items-center gap-2 cursor-pointer mt-1"
            >
              <input
                type="checkbox"
                checked={selected.includes(loc.slug)}
                onChange={() => toggleOffice(loc.slug)}
              />
              <span>{loc.name}</span>
            </label>
          ))}

          {activeLocations.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              No active locations available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicOfficeDropdown;
