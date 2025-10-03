import { useEffect } from 'react';

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void
) {
  useEffect(() => {
    const handle = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        onOutside();
      }
    };

    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);

    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [ref, onOutside]);
}
