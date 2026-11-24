import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard focus handling for modal surfaces (Modal, Drawer):
 * - moves focus inside when the surface opens (unless something inside already has it),
 * - keeps Tab / Shift+Tab cycling inside it,
 * - gives focus back to whatever had it before opening, once it closes.
 *
 * @param ref    the dialog element
 * @param open   the caller's `open` prop
 * @param ready  true while the dialog element is actually mounted and open
 */
export function useDialogFocus(ref: RefObject<HTMLElement | null>, open: boolean, ready: boolean) {
  const restoreRef = useRef<HTMLElement | null>(null);

  // Remember what had focus as soon as `open` flips, before the dialog content
  // mounts: an autofocused control inside would otherwise be mistaken for it.
  useEffect(() => {
    if (!open) return;
    const current = document.activeElement as HTMLElement | null;
    if (current && current !== document.body && !ref.current?.contains(current)) {
      restoreRef.current = current;
    }
  }, [open, ref]);

  useEffect(() => {
    if (!ready) return;
    const node = ref.current;
    if (!node) return;

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    if (!node.contains(document.activeElement)) {
      node.focus({ preventScroll: true });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      // Only the topmost dialog traps: a dialog opened from inside this one
      // lives in its own portal and handles its own Tab.
      const current = document.activeElement;
      if (current && !node.contains(current) && current.closest('[role="dialog"]')) return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!node.contains(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (current === first || current === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Give focus back, unless the app already moved it somewhere on purpose.
      const target = restoreRef.current;
      restoreRef.current = null;
      const current = document.activeElement;
      const focusIsStranded = !current || current === document.body || node.contains(current);
      if (target && focusIsStranded && document.contains(target)) {
        target.focus({ preventScroll: true });
      }
    };
  }, [ref, ready]);
}
