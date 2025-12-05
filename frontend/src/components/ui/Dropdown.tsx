import React, { useRef, useState } from "react";
import { useOutsideClick } from "../../hooks/useOutsideClick";

type DropdownProps = {
  trigger: (args: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  direction?: "up" | "down";
};

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "right",
  className,
  direction = "down",
}) => {
  const [open, setOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  useOutsideClick(wrapRef, close);

  const verticalClasses = direction === "up" ? "bottom-full mb-2" : "mt-2";

  return (
    <div ref={wrapRef} className={`relative inline-block ${className ?? ""}`}>
      {trigger({ open, toggle })}

      {open && (
        <div
          className={`absolute w-40 bg-white border rounded shadow-md z-10 ${verticalClasses} ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={close}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
