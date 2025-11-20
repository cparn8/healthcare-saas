import React, { useState } from "react";
import { IntakeStatus, INTAKE_OPTIONS } from "../../../logic";

interface IntakeDropdownProps {
  value: IntakeStatus;
  onChange: (status: IntakeStatus) => void;
}

const IntakeDropdown: React.FC<IntakeDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = INTAKE_OPTIONS.find((o) => o.key === value);

  return (
    <div className="relative inline-block text-xs">
      <button
        type="button"
        className="flex items-center gap-2 rounded border px-2 py-1 bg-white hover:bg-gray-50"
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
        <div className="absolute z-30 mt-1 w-40 rounded border bg-white shadow-lg">
          {INTAKE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-gray-100 ${
                value === opt.key ? "bg-gray-50" : ""
              }`}
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
