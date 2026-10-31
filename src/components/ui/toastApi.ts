import { createContext, useContext, type ReactNode } from "react";

/**
 * API de toasts sin componentes (para no romper react-refresh).
 * `Toast.tsx` solo exporta componentes; este módulo exporta la función
 * `toast`, el hook `useToast` y el contexto que comparten.
 */

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "secondary";

export interface ToastOptions {
  description?: ReactNode;
  timeout?: number;
  duration?: number;
  indicator?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: ToastVariant;
}

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastFunction {
  (message: ReactNode, options?: ToastOptions): string;
  success: (message: ReactNode, options?: ToastOptions) => string;
  error: (message: ReactNode, options?: ToastOptions) => string;
  warning: (message: ReactNode, options?: ToastOptions) => string;
  info: (message: ReactNode, options?: ToastOptions) => string;
  close: (id: string) => void;
  clear: () => void;
}

export interface ToastContextValue {
  addToast: (message: ReactNode, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

let globalToastHandler: ((message: ReactNode, options?: ToastOptions) => string) | null = null;
let globalCloseHandler: ((id: string) => void) | null = null;
let globalClearHandler: (() => void) | null = null;

/** Conecta el <ToastProvider /> con la API global. */
export function setToastHandlers(handlers: {
  addToast: (message: ReactNode, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}) {
  globalToastHandler = handlers.addToast;
  globalCloseHandler = handlers.removeToast;
  globalClearHandler = handlers.clearToasts;
}

/**
 * Función canónica `toast()` estilo HeroUI / Sonner
 * Permite sintaxis directa:
 *   toast("Paciente registrado con éxito")
 *   toast("Cambios guardados", { description: "...", indicator: <Star /> })
 *   toast.success("Ángulo calibrado a 120°")
 */
export const toast: ToastFunction = Object.assign(
  (message: ReactNode, options?: ToastOptions): string => {
    if (globalToastHandler) {
      return globalToastHandler(message, options);
    }
    console.warn("toast() llamado sin <ToastProvider /> montado.");
    return "";
  },
  {
    success: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "success" });
    },
    error: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "error" });
    },
    warning: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "warning" });
    },
    info: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "info" });
    },
    close: (id: string) => {
      if (globalCloseHandler) globalCloseHandler(id);
    },
    clear: () => {
      if (globalClearHandler) globalClearHandler();
    },
  }
);

/**
 * Hook para acceso dentro de componentes React.
 * Si no hay <ToastProvider /> montado, cae a la API global.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      close: toast.close,
      clear: toast.clear,
      removeToast: toast.close,
      clearToasts: toast.clear,
    };
  }
  return {
    toast,
    success: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: 'success' }),
    error: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: 'error' }),
    warning: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: 'warning' }),
    info: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: 'info' }),
    close: ctx.removeToast,
    clear: ctx.clearToasts,
  };
}
