// frontend/src/features/schedule/components/DatePickerPopover.tsx

import React, { useEffect, useRef, useState } from "react";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import { formatYMDLocal } from "../../../utils";

interface DatePickerPopoverProps {
  value: Date;
  onSelect: (date: Date) => void;
}

/**
 * Small reusable calendar button + popover <input type="date">.
 * Handles its own open/close and outside-click behavior.
 */
const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({
  value,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) return;

    const selected = new Date(v + "T00:00");
    onSelect(selected);
    setOpen(false);
  };

  const inputValue = formatYMDLocal(value);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Calendar icon button */}
      <button
        type="button"
        className="px-2 py-1.5 border rounded-l hover:bg-gray-50 flex items-center"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Calendar className="text-gray-600" />
      </button>

      {/* Floating popover with native date input */}
      {open && (
        <div className="absolute left-0 mt-1 z-50 bg-white border shadow-lg rounded p-2">
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={inputValue}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerPopover;
