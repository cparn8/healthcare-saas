import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import {
  STATUS_OPTIONS,
  BLOCK_STATUS_OPTIONS,
  StatusKey,
} from "../../../logic";

interface StatusDropdownProps {
  value: StatusKey;
  display: React.ReactNode;
  onChange: (status: StatusKey) => void;
  isBlock: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  display,
  onChange,
  isBlock,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const options = isBlock ? BLOCK_STATUS_OPTIONS : STATUS_OPTIONS;

  const handleSelect = (key: StatusKey) => {
    setOpen(false);
    onChange(key);
  };

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
        className="flex items-center gap-1 rounded border border-mBorder-lighter dark:border-dButton-mborder bg-input dark:bg-input-dlight px-2 py-1 hover:bg-grid-slot dark:hover:bg-grid-dslot"
        onClick={() => setOpen((o) => !o)}
      >
        {display}
        <ChevronDown
          size={16}
          className="text-text-secondary dark:text-text-darkSecondary"
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-44 rounded border border-input-border dark:border-dButton-border bg-input-lighter dark:bg-dButton shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-input dark:hover:bg-dButton-mhover ${
                value === opt.key ? "bg-input dark:bg-dButton-mhover" : ""
              }`}
              onClick={() => handleSelect(opt.key)}
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

export default StatusDropdown;
