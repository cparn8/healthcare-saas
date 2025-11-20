import React, { useState } from "react";
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
  const options = isBlock ? BLOCK_STATUS_OPTIONS : STATUS_OPTIONS;

  const handleSelect = (
    key: StatusKey,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.currentTarget?.blur();
    setOpen(false);
    onChange(key);
  };

  return (
    <div className="relative inline-block text-xs">
      <button
        type="button"
        className="flex items-center gap-1 rounded border px-2 py-1 bg-white hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        {display}
        <ChevronDown size={12} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-44 rounded border bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-gray-100 ${
                value === opt.key ? "bg-gray-50" : ""
              }`}
              onClick={(e) => handleSelect(opt.key, e)}
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
