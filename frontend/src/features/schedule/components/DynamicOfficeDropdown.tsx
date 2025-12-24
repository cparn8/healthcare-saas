import React, { useEffect, useRef, useState } from "react";
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
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  /* ---------------- Click outside ---------------- */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded hover:bg-surface-hover hover:dark:bg-surface-dhover min-w-[200px] text-left"
      >
        {displayLabel}
      </button>

      {open && (
        <div className="absolute mt-1 w-56 bg-side dark:bg-side-dark border border-top-border dark:border-top-dborder rounded shadow-lg z-30 p-2">
          {/* ALL */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            <span>Select All</span>
          </label>

          <hr className="my-2 border-border dark:border-border-dark" />

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
