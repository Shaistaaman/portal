import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `onOutside` when a pointer event occurs outside the returned ref's
 * element. Used to close dropdowns/menus, replacing the reference Next.js
 * app's hand-rolled `fixed inset-0` click-catcher overlay pattern (seen
 * twice in apps/portal/app/admin/user-management/page.tsx — the status
 * filter dropdown and the per-row action menu) with one reusable hook.
 */
export function useClickOutside<T extends HTMLElement>(
  onOutside: () => void,
  active: boolean,
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [active, onOutside]);

  return ref;
}
