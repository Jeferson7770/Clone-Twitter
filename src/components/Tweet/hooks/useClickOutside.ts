import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClickOutside: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(target)
      );
      if (isOutside) onClickOutside();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [refs, onClickOutside, enabled]);
}
