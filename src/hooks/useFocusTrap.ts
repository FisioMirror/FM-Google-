import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Mantiene el foco del teclado dentro de un contenedor modal.
 * - Mueve el foco al primer elemento interactivo al abrir.
 * - Cicla con Tab / Shift+Tab (no se escapa al fondo).
 * - Devuelve el foco al disparador al cerrar.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previous = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    const first = getFocusable()[0];
    const focusTimer = window.setTimeout(() => {
      if (first) {
        first.focus({ preventScroll: true });
      } else {
        node.setAttribute('tabindex', '-1');
        node.focus({ preventScroll: true });
      }
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus({ preventScroll: true });
      }
    };

    node.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      node.removeEventListener('keydown', onKeyDown);
      previous?.focus?.({ preventScroll: true });
    };
  }, [active]);

  return ref;
}
