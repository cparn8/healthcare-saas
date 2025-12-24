import React, { useEffect, useRef, useState } from "react";
import { IntakeStatus, INTAKE_OPTIONS } from "../../../logic";

interface IntakeDropdownProps {
  value: IntakeStatus;
  onChange: (status: IntakeStatus) => void;
}

const IntakeDropdown: React.FC<IntakeDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const current = INTAKE_OPTIONS.find((o) => o.key === value);

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
    <div ref={rootRef} className="relative inline-block text-xs">
      <button
        type="button"
        className="flex items-center gap-2 rounded border border-mBorder-lighter dark:border-dButton-mborder bg-input dark:bg-input-dlight px-2 py-1 hover:bg-grid-slot dark:hover:bg-grid-dslot"
        onClick={() => setOpen((o) => !o)}
      >
        {current && (
          <>
            <span
              className={`inline-block h-2 w-2 rounded-full ${current.dotClass}`}
            />
            <span>{current.label}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-40 rounded border border-input-border dark:border-dButton-border bg-input-lighter dark:bg-dButton shadow-lg">
          {INTAKE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-input dark:hover:bg-dButton-mhover"
              onClick={() => {
                setOpen(false);
                onChange(opt.key);
              }}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${opt.dotClass}`}
              />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntakeDropdown;
