import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

/**
 * El layout tiene dos estructuras distintas:
 *  - FisioLayout: el propio <main data-scroll-root> scrollea.
 *  - PatientLayout: <main> está en overflow-hidden y scrollea un hijo interno
 *    (marcado con data-scroll-body).
 * Antes solo se escuchaba al main, así que en el portal del paciente el botón
 * nunca aparecía o quedaba "estancado" visible aun estando arriba del todo.
 */
function getScrollContainer(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>("[data-scroll-body]") ??
    document.querySelector<HTMLElement>("[data-scroll-root]")
  );
}

function scrollContainerToTop(el: HTMLElement) {
  // En algunos WebViews/headless "smooth" se ignora silenciosamente.
  // Fallback determinista: si a los 700 ms no llegó arriba, saltamos.
  try {
    el.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    el.scrollTop = 0;
  }
  window.setTimeout(() => {
    if (el.scrollTop > 2) el.scrollTop = 0;
  }, 700);
}

function scrollToTop() {
  const el = getScrollContainer();
  if (el && el.scrollHeight > el.clientHeight) {
    scrollContainerToTop(el);
    return;
  }
  if (el) scrollContainerToTop(el);
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => {
    if (window.scrollY > 2) window.scrollTo({ top: 0, behavior: "auto" });
  }, 700);
}

export function ScrollToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const location = useLocation();

  const updateVisible = (next: boolean) => {
    if (visibleRef.current === next) return;
    visibleRef.current = next;
    setVisible(next);
  };

  // Scroll to top on route change — targets the layout's scroll container
  useEffect(() => {
    updateVisible(false);
    scrollToTop();
  }, [location.pathname]);

  // Escucha en captura a nivel documento: sirve tanto si scrollea el main,
  // un hijo interno o la ventana, sin depender de que el nodo exista al montar.
  useEffect(() => {
    const readScrollTop = (target: EventTarget | null): number => {
      if (target instanceof HTMLElement && target !== document.documentElement && target !== document.body) {
        return target.scrollTop;
      }
      const container = getScrollContainer();
      return Math.max(window.scrollY, container?.scrollTop ?? 0);
    };

    const handleScroll = (event: Event) => {
      const top = readScrollTop(event.target);
      updateVisible(top > 280);
    };

    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label={t('tr.volver_arriba')}
          className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-6 z-[70] w-12 h-12 rounded-full bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-600/30 shadow-xl flex items-center justify-center"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
