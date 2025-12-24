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

      <div
        className={`
    absolute w-40 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded shadow-md z-40
    transform transition-all duration-150 ease-out
    ${verticalClasses}
    ${align === "right" ? "right-0" : "left-0"}
    ${
      open
        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
        : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
    }
  `}
        onClick={close}
      >
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
