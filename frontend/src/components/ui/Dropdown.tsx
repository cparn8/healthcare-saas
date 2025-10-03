import React, { useRef, useState } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';

type DropdownProps = {
  trigger: (args: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode; // menu content
  align?: 'left' | 'right';
  className?: string; // wrapper class
};

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  className,
}) => {
  const [open, setOpen] = useState(false);

  // explicitly allow null in the type
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  useOutsideClick(wrapRef, close);

  return (
    <div ref={wrapRef} className={`relative inline-block ${className ?? ''}`}>
      {trigger({ open, toggle })}
      {open && (
        <div
          className={`absolute mt-2 w-40 bg-white border rounded shadow-md z-10 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={close} // close when a menu item is clicked
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
